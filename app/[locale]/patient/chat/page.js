"use client";

import { useEffect, useState, useRef } from "react";
import ChatActionsPopover from "../../../components/chat/ChatActionsPopover.client";
import useSocket from "../../../components/chat/useSocket.client";
import { useToast } from "../../../components/ui/Toast";
import { FaPaperPlane, FaPaperclip, FaCheck, FaCheckDouble, FaFilePdf, FaFileAlt, FaVideo, FaPhone } from "react-icons/fa";
import useLocale from "../../../hooks/useLocale";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function PatientChatPage() {
  const { locale } = useLocale();
  const { showToast, ToastContainer } = useToast();
  const router = useRouter();
  const t = useTranslations("patientChat");
  const safeT = (key, fallback) => { try { return t(key); } catch(e) { return fallback; } };

  const [doctorChat, setDoctorChat] = useState({ id: null, doctorName: "", avatar: "👩‍⚕️", isOnline: false });
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ uploading: false, percent: 0, filename: null });
  const [jwtToken, setJwtToken] = useState(null);
  const socket = useSocket();
  const messagesContainerRef = useRef(null);

  // --- Load doctor info ---
  useEffect(() => {
    async function loadDoctor() {
      try {
        const profileRes = await fetch("/api/patient/profile", { credentials: "include" });
        const profileData = await profileRes.json();
        const doctor = profileData?.profile?.doctor;
        if (!doctor) {
          showToast(safeT("noDoctorLinked","لم يتم ربطك بأي طبيب بعد."), "error");
          setDoctorChat(prev => ({ ...prev, doctorName: "الطبيب" }));
          return;
        }
        setDoctorChat(prev => ({ ...prev, doctorName: doctor.fullName, doctorUserId: doctor.userId || doctor.id || (doctor.user && doctor.user.id) }));
      } catch(e) {
        showToast(safeT("errorLoadingChat","خطأ في تحميل بيانات الطبيب"), "error");
      }
    }
    loadDoctor();
  }, []);

    // --- Try to load existing chat for patient on mount so messages and chatId are available ---
    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          const res = await fetch('/api/chat/patient', { credentials: 'include' });
          if (!res.ok) return;
          const data = await res.json();
          const chats = data.chats || [];
          if (!mounted) return;
          if (chats.length) {
            const first = chats[0];
            const chatId = first.id;
            setDoctorChat(prev => ({
              ...prev,
              id: chatId,
              doctorName: first.doctor?.user?.fullName || prev.doctorName,
              doctorUserId: first.doctor?.user?.id || first.doctor?.userId || prev.doctorUserId,
            }));
            // fetch messages immediately to avoid race between effects
            try {
              const mres = await fetch(`/api/chat/${chatId}/messages`, { credentials: 'include' });
              if (mres.ok) {
                const mdata = await mres.json();
                if (mounted) setMessages((mdata.messages || []).map((m) => ({ ...m, time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG") : "" })));
              }
            } catch (e) { /* ignore */ }
          }
        } catch (e) {
          // ignore
        }
      })();
      return () => { mounted = false; };
    }, []);

  // fetch JWT token for socket auth
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/token', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (mounted && data?.token) setJwtToken(data.token);
        }
      } catch (e) { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, []);

  // --- Socket connection ---
  useEffect(() => {
    if (!doctorChat) return;
    if (jwtToken && socket) {
      try { socket.connect({ token: jwtToken }); } catch (e) { socket.connect(); }
    } else {
      socket.connect();
    }

    // join chat room if we already have a chat id so we receive live messages
    try {
      if (doctorChat.id && socket && socket.join) {
        socket.join(doctorChat.id);
      }
    } catch (e) {}

    const offMsg = socket.onMessage((msg) => {
      if (!msg) return;
      setMessages(prev => {
        if (msg.id && prev.some(m => m.id === msg.id)) return prev;
        if (msg.clientKey && prev.some(m => m.clientKey === msg.clientKey)) return prev;
        const mapped = {
          ...msg,
          time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG") : msg.time || "",
          file: msg.fileUrl ? { url: msg.fileUrl, type: msg.mimeType, name: msg.fileName } : (msg.file || null)
        };
        return [...prev, mapped];
      });
    });

    const offUpdate = socket.onMessageUpdate((upd) => {
      if (!upd || !upd.id) return;
      setMessages(prev => prev.map(m => m.id === upd.id ? { ...m, status: upd.status } : m));
    });

    const offRead = socket.onMessageRead((info) => {
      if (!info || !info.messageId) return;
      setMessages(prev => prev.map(m => m.id === info.messageId ? { ...m, status: 'read' } : m));
    });

    const offPresence = socket.onPresence(({ userId, online }) => {
      // if presence refers to the linked doctor, update UI
      if (doctorChat.doctorUserId && userId && String(userId) === String(doctorChat.doctorUserId)) {
        setDoctorChat(prev => ({ ...prev, isOnline: online }));
      }
    });

    return () => {
      offMsg && offMsg();
      offUpdate && offUpdate();
      offRead && offRead();
      offPresence && offPresence();
    };
  }, [doctorChat, locale, socket]);

  // --- Auto scroll ---
  useEffect(() => {
    const el = messagesContainerRef.current;
    if(!el) return;
    try { el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); } catch(e){ el.scrollTop = el.scrollHeight; }
  }, [messages.length]);

  // --- Load messages when chat exists (so they persist on reload) ---
  useEffect(() => {
    let mounted = true;
    const chatId = doctorChat && doctorChat.id;
    if (!chatId) return;
    (async () => {
      try {
        const res = await fetch(`/api/chat/${chatId}/messages`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const mapped = (data.messages || []).map((m) => ({ ...m, time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG") : "" }));
        setMessages(mapped);
      } catch (e) {
        console.error('failed to load messages', e);
      }
    })();
    return () => { mounted = false; };
  }, [doctorChat && doctorChat.id, locale]);

  // --- Send message ---
  const handleSendMessage = async () => {
    let chatId = doctorChat.id;

    // إنشاء الدردشة إذا لم توجد
    if(!chatId) {
      try {
        const res = await fetch("/api/chat/patient", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          credentials: "include"
        });
        const data = await res.json();
        if(res.ok && data.chat && data.chat.id){
          chatId = data.chat.id;
          setDoctorChat(prev => ({ ...prev, id: chatId }));
        } else {
          showToast(data.error || safeT("noChatUntilDoctorStarts","خطأ في إنشاء الدردشة"), "error");
          return;
        }
      } catch(e){
        showToast(safeT("connectionError","خطأ في الاتصال"),"error");
        return;
      }
    }

    // --- Upload file if exists (presigned/init -> PUT -> complete) ---
    if (file) {
      const tempId = `tmpfile-${Date.now()}`;
      const tempMsg = { id: tempId, chatId, sender: "patient", status: "sent", time: new Date().toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG"), clientKey: tempId, file };
      setMessages(prev => [...prev, tempMsg]);

      try {
        const initRes = await fetch('/api/uploads/init', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ chatId, filename: file.name, contentType: file.type })
        });
        const initData = await initRes.json();
        if (!initRes.ok || !initData?.uploadUrl) { setMessages(prev => prev.filter(m => m.id !== tempId)); showToast(initData?.error || safeT('errorSendMessage','خطأ عند إرسال الملف'),'error'); setFile(null); return; }

        // upload with XHR for progress
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', initData.uploadUrl, true);
          if (initData.provider === 's3' && file.type) xhr.setRequestHeader('Content-Type', file.type);
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const percent = Math.round((ev.loaded / ev.total) * 100);
              setUploadProgress({ uploading: true, percent, filename: file.name });
            }
          };
          xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) resolve(); else reject(new Error('Upload failed')); };
          xhr.onerror = () => reject(new Error('Upload failed'));
          xhr.send(file);
        });

        const compRes = await fetch('/api/uploads/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ chatId, key: initData.key, filename: file.name, contentType: file.type, provider: initData.provider, bucket: initData.bucket, region: initData.region }) });
        const compData = await compRes.json();
        if (!compRes.ok || !compData?.url) { setMessages(prev => prev.filter(m => m.id !== tempId)); showToast(compData?.error || safeT('errorSendMessage','خطأ عند إرسال الملف'),'error'); setUploadProgress({ uploading:false, percent:0, filename:null }); setFile(null); return; }
        // update temp message to include file url
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, file: { ...file, url: compData.url } } : m));
        setUploadProgress({ uploading: false, percent: 0, filename: null });

        // Notify server / room about the new message
        try {
          if (socket && socket.connected) {
            socket.sendMessage({ chatId, fileUrl: compData.url, mimeType: file.type, fileName: file.name, clientKey: tempId }, (res) => {
              if (res && res.ok && res.message) {
                setMessages(prev => {
                  const filtered = prev.filter(x => x.id !== tempId && x.id !== res.message.id);
                  const serverMsg = { ...res.message, time: res.message.createdAt ? new Date(res.message.createdAt).toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG") : "" };
                  return [...filtered, serverMsg];
                });
              } else {
                // fallback: try HTTP POST
                (async () => {
                  try {
                    const r = await fetch(`/api/chat/${chatId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ fileUrl: compData.url, mimeType: file.type, fileName: file.name, clientKey: tempId }) });
                    if (r.ok) {
                      const d = await r.json();
                      // refresh messages
                      const r2 = await fetch(`/api/chat/${chatId}/messages`, { credentials: 'include' });
                      if (r2.ok) {
                        const refreshed = await r2.json();
                        setMessages((refreshed.messages || []).map((m) => ({ ...m, time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG") : "" })));
                      }
                    }
                  } catch (e) { console.error('fallback post message failed', e); }
                })();
              }
            });
          } else {
            // socket not connected, use HTTP POST
            const r = await fetch(`/api/chat/${chatId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ fileUrl: compData.url, mimeType: file.type, fileName: file.name, clientKey: tempId }) });
            if (r.ok) {
              const r2 = await fetch(`/api/chat/${chatId}/messages`, { credentials: 'include' });
              if (r2.ok) {
                const refreshed = await r2.json();
                setMessages((refreshed.messages || []).map((m) => ({ ...m, time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG") : "" })));
              }
            }
          }
        } catch (e) { console.error('notify message failed', e); }
      } catch (e) {
        console.error(e);
        setMessages(prev => prev.filter(m => m.id !== tempId));
        showToast(safeT('connectionError','خطأ في الاتصال'),'error');
        setUploadProgress({ uploading: false, percent: 0, filename: null });
      } finally { setFile(null); return; }
    }

    // --- Send text message ---
    if(!messageInput.trim()) return;
    const tempId = `tmp-${Date.now()}`;
    const tempMsg = { id: tempId, chatId, sender:"patient", text:messageInput, status:"sent", time:new Date().toLocaleTimeString(locale==="en"?"en-US":"ar-EG"), clientKey:tempId };
    setMessages(prev=>[...prev,tempMsg]);
    const textToSend = messageInput;
    setMessageInput("");

    if(socket && socket.connected){
      socket.sendMessage({ chatId, text:textToSend, clientKey:tempId }, res=>{
        if(res && res.ok && res.message){
          setMessages(prev=>{
            const filtered = prev.filter(x=>x.id!==tempId && x.id!==res.message.id);
            const serverMsg = {...res.message, time: res.message.createdAt ? new Date(res.message.createdAt).toLocaleTimeString(locale==="en"?"en-US":"ar-EG") : ""};
            return [...filtered, serverMsg];
          });
        } else { setMessages(prev=>prev.filter(x=>x.id!==tempId)); showToast((res?.error) || safeT("errorSendMessage","خطأ عند إرسال الرسالة"),"error"); }
      });
    } else {
      try {
        const res = await fetch(`/api/chat/${chatId}/messages`, { method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({text:textToSend}) });
        if(!res.ok) showToast(safeT("errorSendMessage","خطأ عند إرسال الرسالة"),"error");
      } catch(e){ showToast(safeT("connectionError","خطأ في الاتصال"),"error"); setMessages(prev=>prev.filter(x=>x.id!==tempId)); }
    }
  };

  const handleFileChange = e => { const selected = e.target.files[0]; if(selected) setFile(selected); };
  const handleRetryUpload = async (messageId) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg || !msg.file) return;
    const theFile = msg.file && msg.file instanceof File ? msg.file : msg.file;
    // mark uploading
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'uploading' } : m));
    try {
      const initRes = await fetch('/api/uploads/init', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ chatId: msg.chatId, filename: theFile.name, contentType: theFile.type }) });
      const initData = await initRes.json();
      if (!initRes.ok || !initData?.uploadUrl) throw new Error(initData?.error || 'init_failed');
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', initData.uploadUrl, true);
        if (initData.provider === 's3' && theFile.type) xhr.setRequestHeader('Content-Type', theFile.type);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setUploadProgress({ uploading: true, percent: Math.round((ev.loaded/ev.total)*100), filename: theFile.name });
        };
        xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) resolve(); else reject(new Error('upload_failed')); };
        xhr.onerror = () => reject(new Error('upload_failed'));
        xhr.send(theFile);
      });
      const compRes = await fetch('/api/uploads/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ chatId: msg.chatId, key: initData.key, filename: theFile.name, contentType: theFile.type, provider: initData.provider, bucket: initData.bucket, region: initData.region }) });
      const compData = await compRes.json();
      if (!compRes.ok || !compData?.url) throw new Error(compData?.error || 'complete_failed');
      // send message with URL
      const msgRes = await fetch(`/api/chat/${msg.chatId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ fileUrl: compData.url, mimeType: theFile.type, fileName: theFile.name }) });
      if (!msgRes.ok) throw new Error('send_failed');
      // replace temp message with server message via fetching messages list
      const res2 = await fetch(`/api/chat/${msg.chatId}/messages`, { credentials: 'include' });
      if (res2.ok) {
        const refreshed = await res2.json();
        const mapped = (refreshed.messages || []).map((m) => ({ ...m, time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG") : "" }));
        setMessages(mapped);
      }
      setUploadProgress({ uploading: false, percent: 0, filename: null });
    } catch (e) {
      console.error('retry upload failed', e);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'failed' } : m));
      setUploadProgress({ uploading: false, percent: 0, filename: null });
      showToast(safeT('errorSendMessage','خطأ عند إرسال الملف'), 'error');
    }
  };
  const handleKeyPress = e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); handleSendMessage(); } };
  const handleDeleteChat = async () => { setMessages([]); showToast(safeT("chatDeleted","تم حذف الرسائل من الصندوق فقط"),"success"); };

  return (
    <>
      <ToastContainer />
      <div className="h-screen bg-gray-50 dark:bg-slate-950 flex">
        <div className="flex-1 flex flex-col">
          {doctorChat ? (
            <>
              {/* Header */}
              <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">{doctorChat.avatar}</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{doctorChat.doctorName}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>showToast(safeT("voiceCallSoon","سيتم دعم الاتصال الصوتي لاحقاً"),"info")} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"><FaPhone/></button>
                  <button onClick={()=>showToast(safeT("videoCallSoon","سيتم دعم الاتصال المرئي لاحقاً"),"info")} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"><FaVideo/></button>
                  <ChatActionsPopover onDelete={handleDeleteChat} confirmText={safeT("confirmDelete","هل تريد حذف المحادثة؟")} confirmYes={safeT("delete","حذف")} confirmNo={safeT("cancel","إلغاء")} />
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length===0 ? <div className="text-center text-gray-400 dark:text-gray-500">{safeT("emptyStateDescription","لا توجد رسائل بعد")}</div>
                : messages.map((msg, idx)=>(
                  <div key={msg.clientKey || `${msg.id}-${idx}`} className={`flex ${msg.sender==="patient"?"justify-start":"justify-end"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.sender==="patient"?"bg-blue-600 text-white":"bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow"}`}>
                      {msg.file && typeof msg.file === 'object' && typeof msg.file.type === 'string' ? (
                        msg.file.type.startsWith("image/") ? <img src={msg.file.url||URL.createObjectURL(msg.file)} alt="img" className="max-w-full rounded"/>
                        : msg.file.type === "application/pdf" ? <div className="flex items-center gap-2"><FaFilePdf className="text-red-500"/><a href={msg.file.url||URL.createObjectURL(msg.file)} target="_blank" className="underline">{msg.file.name}</a></div>
                        : <div className="flex items-center gap-2"><FaFileAlt/><a href={msg.file.url||URL.createObjectURL(msg.file)} target="_blank" className="underline">{msg.file.name}</a></div>
                      ) : <p className="text-sm mb-1">{msg.text}</p>}
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <span>{msg.time}</span>
                        <div className="flex items-center gap-2">
                          {msg.sender==="patient" && <span>{msg.status==="sent"?<FaCheck/>:msg.status==="delivered"?<FaCheckDouble/>:msg.status==="read"?<FaCheckDouble className="text-blue-300"/>:null}</span>}
                          {msg.status === 'failed' && (
                            <button onClick={() => handleRetryUpload(msg.id)} className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">{safeT('retry','Retry')}</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4 flex gap-2 items-center">
                <label className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full cursor-pointer">
                  <FaPaperclip className="text-gray-600 dark:text-gray-400"/>
                  <input type="file" onChange={handleFileChange} className="hidden"/>
                </label>
                <div className="flex-1">
                  {uploadProgress.uploading && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-600">{uploadProgress.filename} — {uploadProgress.percent}%</div>
                      <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
                        <div className="h-2 bg-blue-600" style={{ width: `${uploadProgress.percent}%` }} />
                      </div>
                    </div>
                  )}
                  <input type="text" value={messageInput} onChange={e=>setMessageInput(e.target.value)} onKeyPress={handleKeyPress} placeholder={safeT("messagePlaceholder","اكتب رسالة...")} className="w-full px-4 py-3 border rounded-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"/>
                </div>
                <button onClick={handleSendMessage} disabled={!messageInput.trim() && !file} className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full"><FaPaperPlane/></button>
              </div>
            </>
          ) : <div className="flex-1 flex items-center justify-center text-center"><div><div className="text-6xl mb-4">💬</div><h3 className="text-xl font-bold text-gray-900 dark:text-white">{safeT("emptyStateTitle","ابدأ المحادثة")}</h3><p className="text-gray-500 dark:text-gray-400">{safeT("emptyStateDescription","لم يتم بدء المحادثة بعد")}</p></div></div>}
        </div>
      </div>
    </>
  );
}

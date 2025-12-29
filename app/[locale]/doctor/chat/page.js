"use client";




import DoctorLayout from "../DoctorLayout";
import { useToast } from "../../../components/ui/Toast";
import { useEffect, useState, useRef, useMemo } from "react";
import useSocket from "../../../components/chat/useSocket.client";
import ChatActionsPopover from "../../../components/chat/ChatActionsPopover.client";
import { useRouter } from "next/navigation";
import useLocale from "../../../hooks/useLocale";
import {
  FaComments,
  FaSearch,
  FaPaperPlane,
  FaPaperclip,
  FaCircle,
  FaPhone,
  FaVideo,
  FaCheck,
  FaCheckDouble,
} from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function Page() {
  const { showToast, ToastContainer } = useToast();
  const t = useTranslations("doctorChat");
  const safeT = (key, fallback) => {
    try { return t(key); } catch (e) { return fallback; }
  };

  const router = useRouter();
  const { locale } = useLocale();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [messagesMap, setMessagesMap] = useState({});
  const [loadingChats, setLoadingChats] = useState(true);
  const [socketMismatch, setSocketMismatch] = useState(false);
  const [jwtToken, setJwtToken] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [uploadProgress, setUploadProgress] = useState({ uploading: false, percent: 0, filename: null });

  const socket = useSocket();
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  // listen for retry events dispatched from retry buttons
  useEffect(() => {
    function onRetry(e) {
      const { chatId, messageId } = e.detail || {};
      if (!chatId || !messageId) return;
      const list = messagesMap[chatId] || [];
      const msg = list.find(m => m.id === messageId);
      if (!msg || !msg.file) return;
      // reuse patient retry logic: perform init -> PUT -> complete -> post message
      (async () => {
        try {
          setMessagesMap((m) => ({ ...m, [chatId]: (m[chatId] || []).map(mm => mm.id === messageId ? { ...mm, status: 'uploading' } : mm) }));
          const initRes = await fetch('/api/uploads/init', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ chatId, filename: msg.file.name, contentType: msg.file.type }) });
          const initData = await initRes.json();
          if (!initRes.ok || !initData?.uploadUrl) throw new Error('init_failed');
          await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', initData.uploadUrl, true);
            if (initData.provider === 's3' && msg.file.type) xhr.setRequestHeader('Content-Type', msg.file.type);
            xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) resolve(); else reject(new Error('upload_failed')); };
            xhr.onerror = () => reject(new Error('upload_failed'));
            xhr.send(msg.file);
          });
          const compRes = await fetch('/api/uploads/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ chatId, key: initData.key, filename: msg.file.name, contentType: msg.file.type, provider: initData.provider, bucket: initData.bucket, region: initData.region }) });
          const compData = await compRes.json();
          if (!compRes.ok || !compData?.url) throw new Error('complete_failed');
          // send message containing the file URL (store as file metadata)
          const msgRes = await fetch(`/api/chat/${chatId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ fileUrl: compData.url, mimeType: msg.file.type, fileName: msg.file.name }) });
          if (!msgRes.ok) throw new Error('send_failed');
          const res2 = await fetch(`/api/chat/${chatId}/messages`, { credentials: 'include' });
          if (res2.ok) {
            const refreshed = await res2.json();
            const mapped = (refreshed.messages || []).map((m) => ({ ...m, time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : '' }));
            setMessagesMap((m) => ({ ...m, [chatId]: mapped }));
          }
        } catch (e) {
          console.error('retry upload failed', e);
          setMessagesMap((m) => ({ ...m, [chatId]: (m[chatId] || []).map(mm => mm.id === messageId ? { ...mm, status: 'failed' } : mm) }));
          showToast('فشل إعادة الرفع', 'error');
        }
      })();
    }
    window.addEventListener('chat:retry-upload', onRetry);
    return () => window.removeEventListener('chat:retry-upload', onRetry);
  }, [messagesMap]);

  const patientIdToConversation = useMemo(() => {
    const map = {};
    conversations.forEach((c) => { if (c.patientId) map[c.patientId] = c; });
    return map;
  }, [conversations]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return allPatients;
    return allPatients.filter((p) => p.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allPatients, searchQuery]);

  const currentChat = selectedChat ? conversations.find((c) => c.id === selectedChat) : null;
  const currentMessages = selectedChat ? messagesMap[selectedChat] || [] : [];

  // When selectedChat changes: join room and fetch history
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedChat) return;
      try {
        try { socket?.join && socket.join(selectedChat); } catch (e) {}
        if (!messagesMap[selectedChat] || messagesMap[selectedChat].length === 0) {
          const res = await fetch(`/api/chat/${selectedChat}/messages`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (!mounted) return;
              const mapped = (data.messages || []).map((msg) => ({ ...msg, time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : '' }));
              setMessagesMap((m) => ({ ...m, [selectedChat]: mapped }));
              // mark messages as read for current user where applicable
              try {
                const unreadIds = (mapped || []).filter((msg) => msg.sender !== 'doctor' && msg.id).map((m) => m.id);
                if (unreadIds.length && socket?.emitEvent) {
                  socket.emitEvent('read_ack', { messageIds: unreadIds });
                  // optimistic local update
                  setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).map(mm => ({ ...mm, status: mm.sender !== 'doctor' ? 'read' : mm.status })) }));
                }
              } catch (e) { console.error('read ack emit', e); }
          }
        }
      } catch (e) { console.error(e); }
    })();
    return () => { mounted = false; try { socket?.leave && socket.leave(selectedChat); } catch (e) {} };
  }, [selectedChat]);

  // Auto-scroll to bottom when new messages arrive for the open chat
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !selectedChat) return;
    const list = messagesMap[selectedChat] || [];
    // if user is near bottom, auto-scroll
    const isNearBottom = (container.scrollHeight - container.scrollTop - container.clientHeight) < 150;
    if (isNearBottom) {
      requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
    }
  }, [messagesMap, selectedChat]);

  // Fetch JWT token on mount
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

  // Connect socket with JWT when available and register handlers
  useEffect(() => {
    if (!socket || !jwtToken) return;
    try { socket.connect({ token: jwtToken }); } catch (e) {}

    // Verify socket identity matches current JWT to avoid mismatched sessions
    try {
      // decode JWT payload to get expected user id (no verification, just parse)
      const decodePayload = (tok) => {
        try {
          const parts = tok.split('.');
          if (parts.length < 2) return null;
          const b = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const json = decodeURIComponent(atob(b).split('').map(function(c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join(''));
          return JSON.parse(json);
        } catch (e) { return null; }
      };
      const expected = decodePayload(jwtToken);
      const expectedUserId = expected && expected.id;

      const onMe = (info) => {
        try {
          const actualId = info && info.id;
          // log detailed debug info for diagnosis (type + value)
          console.group('[Socket Identity Check]');
          console.log('expectedUserId (from JWT):', expectedUserId, typeof expectedUserId);
          console.log('info.id (from server):', actualId, typeof actualId);
          console.log('full info from server:', info);
          try { console.log('jwtToken (short):', jwtToken && jwtToken.slice(0,20)); } catch(e) {}
          console.groupEnd();

          if (!info || !actualId) return;
          // compare as strings to avoid type mismatch false-negatives
          if (expectedUserId && String(actualId) !== String(expectedUserId)) {
            // mismatch: disconnect and mark mismatch so UI prompts re-login
            try { socket.disconnect && socket.disconnect(); } catch (e) {}
            try {
              const userKey = socket && socket.__app_userKey;
              if (userKey && globalThis.__app_socket_by_user && globalThis.__app_socket_by_user[userKey]) {
                delete globalThis.__app_socket_by_user[userKey];
              } else {
                delete globalThis.__app_socket;
                try { globalThis.__app_socket_refcount = 0; } catch (e) {}
                delete globalThis.__app_socket_userId;
              }
            } catch (e) {}
            setSocketMismatch(true);
          }
        } catch (e) { console.error('whoami check failed', e); }
      };

      try {
        socket.emitEvent && socket.emitEvent('whoami');
        // listen for server's 'me' reply
        socket.onPresence && socket.onPresence(() => {}); // no-op to ensure socket exists
        socket.on && socket.on('me', onMe);
      } catch (e) {}

      // cleanup listener on unmount/cleanup
      const cleanupWhoami = () => { try { socket && socket.off && socket.off('me', onMe); } catch (e) {} };

      // ensure cleanup in effect return
      // note: we can't directly modify the returned cleanup closures here, but we remove the listener below in the main return
      // store on window for potential removal
      window.__chat_cleanup_whoami = cleanupWhoami;
    } catch (e) { /* ignore */ }

    const offMessage = socket.onMessage((msg) => {
      try {
        if (!msg) return;
        const mapped = {
          ...msg,
          time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
          file: msg.fileUrl ? { url: msg.fileUrl, type: msg.mimeType, name: msg.fileName } : (msg.file || null)
        };
        setMessagesMap((m) => {
          const list = m[msg.chatId] || [];
          // avoid duplicates when the same client already added the message optimistically
          if (msg.id && list.some(x => x.id === msg.id)) return m;
          if (msg.clientKey && list.some(x => x.clientKey === msg.clientKey)) return m;
          return { ...m, [msg.chatId]: [...list, mapped] };
        });
        setConversations((cs) => cs.map((c) => c.id === msg.chatId ? { ...c, lastMessage: msg.text || '', lastMessageTime: mapped.time } : c));
        if (selectedChat && msg.chatId === selectedChat) {
          try { socket.emitEvent && socket.emitEvent('delivered_ack', { messageIds: [msg.id] }); } catch (e) {}
        }
      } catch (e) { console.error('onMessage handler', e); }
    });

    const offTyping = socket.onTyping(({ userId, typing }) => {
      try {
        if (!userId) return;
        setTypingUsers((s) => ({ ...s, [userId]: typing }));
        if (typing) {
          // auto-clear after 3s to avoid stuck state
          setTimeout(() => setTypingUsers((s) => ({ ...s, [userId]: false })), 3000);
        }
      } catch (e) { console.error('typing handler', e); }
    });

    const offPresence = socket.onPresence(({ userId, online }) => {
      setConversations((cs) => cs.map((c) => (c.patientId === userId ? { ...c, online } : c)));
      let offConnErr = null;
    });

    const offUpdate = socket.onMessageUpdate((upd) => {
      try {
        if (!upd || !upd.id) return;
        setMessagesMap((m) => {
          const chatEntries = Object.keys(m).reduce((acc, k) => ({ ...acc, [k]: m[k].map(msg => msg.id === upd.id ? { ...msg, status: upd.status } : msg) }), {});
          return { ...m, ...chatEntries };
        });
      } catch (e) { console.error('message_update handler', e); }
    });

    const offRead = socket.onMessageRead((info) => {
      try {
        if (!info || !info.messageId) return;
        setMessagesMap((m) => {
          const chatEntries = Object.keys(m).reduce((acc, k) => ({ ...acc, [k]: m[k].map(msg => msg.id === info.messageId ? { ...msg, status: 'read' } : msg) }), {});
          return { ...m, ...chatEntries };
        try { offConnErr && offConnErr(); } catch (e) {}
        });
      } catch (e) { console.error('message_read handler', e); }
    });

    try {
      const offConnErr = socket.onConnectError((err) => {
        if (err && err.message && (err.message === 'invalid_token' || err.message === 'unauthenticated')) {
          setSocketMismatch(true);
        }
      });
      // ensure cleanup of connect_error listener
      // append to cleanup list
      const originalReturn = () => { try { offConnErr && offConnErr(); } catch (e) {} };
      // we'll call originalReturn in final cleanup along with others
    } catch (e) {}

    return () => {
      try { offMessage && offMessage(); } catch (e) {}
      try { offTyping && offTyping(); } catch (e) {}
      try { offPresence && offPresence(); } catch (e) {}
      try { offUpdate && offUpdate(); } catch (e) {}
      try { offRead && offRead(); } catch (e) {}
      try { if (window.__chat_cleanup_whoami) { window.__chat_cleanup_whoami(); window.__chat_cleanup_whoami = null; } } catch (e) {}
    };
  }, [socket, jwtToken, selectedChat, t, showToast]);

  // Load conversations and patients
  useEffect(() => {
    let mounted = true;
    async function loadChatsAndPatients() {
      try {
        const res = await fetch("/api/chat/doctor", { credentials: "include" });
        if (res.status === 403) {
          showToast("ليس لديك إذن لعرض هذه الصفحة — جاري إعادة التوجيه.", "error");
          router.push(`/${locale}/patient/chat`);
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || "خطأ في جلب المحادثات", "error");
          return;
        }

        const convs = (data.chats || []).map((c) => ({
          id: c.id,
          patientId: c.patient?.id,
          patientName: c.patient?.fullName || "مريض",
          lastMessage: c.messages?.[0]?.text || "",
          lastMessageTime: c.messages?.[0]?.createdAt ? new Date(c.messages[0].createdAt).toLocaleTimeString() : "",
          unreadCount: 0,
          online: false,
          avatar: "👨",
        }));

        if (!mounted) return;
        setConversations(convs);
        setSelectedChat((prev) => prev ?? (convs.length ? convs[0].id : null));

        const res2 = await fetch("/api/doctor/patients", { credentials: "include" });
        const patients = res2.ok ? await res2.json() : [];
        setAllPatients(patients);
      } catch (e) {
        console.error(e);
        showToast("خطأ في جلب البيانات", "error");
      } finally {
        if (mounted) setLoadingChats(false);
      }
    }
    loadChatsAndPatients();
    return () => { mounted = false; };
  }, [locale, router, showToast]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) {
      showToast("الرسالة فارغة", "error");
      return;
    }
    const tempId = `tmp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      chatId: selectedChat,
      sender: "doctor",
      text: messageInput,
      status: "sent",
      time: new Date().toLocaleTimeString(),
      clientKey: tempId
    };
    setMessagesMap((m) => ({ ...m, [selectedChat]: [...(m[selectedChat] || []), tempMsg] }));
    setConversations((cs) => cs.map((c) => (c.id === selectedChat ? { ...c, lastMessage: messageInput } : c)));
    const textToSend = messageInput;
    setMessageInput("");

    const removeTemp = () => setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).filter((x) => x.id !== tempId) }));

    try {
      if (socket && socket.connected) {
        socket.sendMessage({ chatId: selectedChat, text: textToSend, clientKey: tempId }, (res) => {
          if (res?.ok && res.message) {
            setMessagesMap((m) => {
              const list = (m[selectedChat] || []).filter((x) => x.id !== tempId);
              // If server message already delivered via 'message' event, avoid adding duplicate
              if (res.message && list.some(x => (res.message.id && x.id === res.message.id) || (res.message.clientKey && x.clientKey === res.message.clientKey))) {
                return { ...m, [selectedChat]: list };
              }
              return { ...m, [selectedChat]: [...list, { ...res.message, time: res.message.createdAt ? new Date(res.message.createdAt).toLocaleTimeString() : "" }] };
            });
            showToast("تم إرسال الرسالة", "success");
          } else {
            removeTemp();
            showToast(res?.error || "خطأ عند إرسال الرسالة", "error");
          }
        });
      } else {
        const res = await fetch(`/api/chat/${selectedChat}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: textToSend }),
        });
        const data = await res.json();
        if (!res.ok) {
          removeTemp();
          showToast(data.error || "خطأ عند إرسال الرسالة", "error");
          return;
        }
        const res2 = await fetch(`/api/chat/${selectedChat}/messages`, { credentials: "include" });
        const refreshed = await res2.json();
        if (res2.ok) {
          const mapped = (refreshed.messages || []).map((msg) => ({ ...msg, time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : "" }));
          setMessagesMap((m) => ({ ...m, [selectedChat]: mapped }));
        }
        showToast("تم إرسال الرسالة", "success");
      }
    } catch (e) {
      console.error(e);
      removeTemp();
      showToast("خطأ في الاتصال", "error");
    }
  };

  const handleAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file || !selectedChat) return;
      // Create temp message for optimistic UI and retry support
      const tempId = `tmpfile-${Date.now()}`;
      const tempMsg = { id: tempId, chatId: selectedChat, sender: 'doctor', status: 'sent', time: new Date().toLocaleTimeString(), clientKey: tempId, file };
      setMessagesMap((m) => ({ ...m, [selectedChat]: [...(m[selectedChat] || []), tempMsg] }));
      try {
        // Initialize upload (returns an upload URL + key)
        const initRes = await fetch('/api/uploads/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ chatId: selectedChat, filename: file.name, contentType: file.type })
        });
        const initData = await initRes.json();
        if (!initRes.ok || !initData?.uploadUrl) {
          setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).map(mm => mm.id === tempId ? { ...mm, status: 'failed' } : mm) }));
          showToast(initData?.error || 'فشل تهيئة الرفع', 'error');
          return;
        }

        // Upload with progress using XHR (fetch doesn't support progress reliably)
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', initData.uploadUrl, true);
          // set content-type for S3 signed PUTs if provided
          if (initData.provider === 's3' && file.type) {
            xhr.setRequestHeader('Content-Type', file.type);
          }
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const percent = Math.round((ev.loaded / ev.total) * 100);
              setUploadProgress({ uploading: true, percent, filename: file.name });
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error('Upload failed'));
          };
          xhr.onerror = () => reject(new Error('Upload failed'));
          xhr.send(file);
        });

        // Complete upload and get public URL
        const compRes = await fetch('/api/uploads/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ chatId: selectedChat, key: initData.key, filename: file.name, contentType: file.type, provider: initData.provider, bucket: initData.bucket, region: initData.region })
        });
        const compData = await compRes.json();
        if (!compRes.ok || !compData?.url) {
          setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).map(mm => mm.id === tempId ? { ...mm, status: 'failed' } : mm) }));
          showToast(compData?.error || 'فشل إنهاء الرفع', 'error');
          return;
        }
        // Send message containing the file metadata via socket (fallback to HTTP)
        try {
          if (socket && socket.connected) {
            socket.sendMessage({ chatId: selectedChat, fileUrl: compData.url, mimeType: file.type, fileName: file.name, clientKey: tempId }, (res) => {
              if (res && res.ok && res.message) {
                setMessagesMap((m) => {
                  const list = (m[selectedChat] || []).filter((x) => x.id !== tempId);
                  // avoid duplicates if message already emitted
                  if (res.message && list.some(x => (res.message.id && x.id === res.message.id) || (res.message.clientKey && x.clientKey === res.message.clientKey))) {
                    return { ...m, [selectedChat]: list };
                  }
                  return { ...m, [selectedChat]: [...list, { ...res.message, time: res.message.createdAt ? new Date(res.message.createdAt).toLocaleTimeString() : "" }] };
                });
                showToast('تم إرسال الملف بنجاح', 'success');
                setUploadProgress({ uploading: false, percent: 0, filename: null });
              } else {
                // fallback to HTTP POST
                (async () => {
                  const msgRes = await fetch(`/api/chat/${selectedChat}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ fileUrl: compData.url, mimeType: file.type, fileName: file.name, clientKey: tempId }) });
                  if (!msgRes.ok) {
                    setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).map(mm => mm.id === tempId ? { ...mm, status: 'failed' } : mm) }));
                    const err = await msgRes.json().catch(() => ({}));
                    showToast(err.error || 'فشل إرسال الرسالة مع الملف', 'error');
                    return;
                  }
                  const res2 = await fetch(`/api/chat/${selectedChat}/messages`, { credentials: 'include' });
                  if (res2.ok) {
                    const refreshed = await res2.json();
                    const mapped = (refreshed.messages || []).map((m) => ({ ...m, time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : "" }));
                    setMessagesMap((m) => ({ ...m, [selectedChat]: mapped }));
                  }
                  showToast('تم إرسال الملف بنجاح', 'success');
                  setUploadProgress({ uploading: false, percent: 0, filename: null });
                })();
              }
            });
          } else {
            const msgRes = await fetch(`/api/chat/${selectedChat}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ fileUrl: compData.url, mimeType: file.type, fileName: file.name, clientKey: tempId }) });
            if (!msgRes.ok) {
              setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).map(mm => mm.id === tempId ? { ...mm, status: 'failed' } : mm) }));
              const err = await msgRes.json().catch(() => ({}));
              showToast(err.error || 'فشل إرسال الرسالة مع الملف', 'error');
              return;
            }
            const res2 = await fetch(`/api/chat/${selectedChat}/messages`, { credentials: 'include' });
            if (res2.ok) {
              const mapped = (await res2.json()).messages.map((m) => ({ ...m, time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : "" }));
              setMessagesMap((m) => ({ ...m, [selectedChat]: mapped }));
            }
            showToast('تم إرسال الملف بنجاح', 'success');
            setUploadProgress({ uploading: false, percent: 0, filename: null });
          }
        } catch (e) {
          console.error('send file message failed', e);
          setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).map(mm => mm.id === tempId ? { ...mm, status: 'failed' } : mm) }));
          showToast('خطأ في إرسال الرسالة مع الملف', 'error');
          setUploadProgress({ uploading: false, percent: 0, filename: null });
        }
      } catch (e) {
        console.error(e);
        setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).map(mm => mm.id === tempId ? { ...mm, status: 'failed' } : mm) }));
        showToast('خطأ في رفع الملف', 'error');
      }
    };
    input.click();
  };

  const handleVoiceCall = () => showToast("بدء مكالمة صوتية", "info");
  const handleVideoCall = () => showToast("بدء مكالمة فيديو", "info");

  const deleteSelectedChat = async () => {
    if (!selectedChat) return;
    try {
      const res = await fetch(`/api/chat/${selectedChat}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "خطأ عند حذف المحادثة", "error");
        return;
      }
      setConversations((cs) => cs.filter((c) => c.id !== selectedChat));
      setMessagesMap((m) => { const copy = { ...m }; delete copy[selectedChat]; return copy; });
      setSelectedChat((prev) => {
        const remaining = conversations.filter((c) => c.id !== prev);
        return remaining.length ? remaining[0].id : null;
      });
      showToast(safeT("deletedToast", "تم حذف المحادثة"), "success");
    } catch (e) {
      console.error(e);
      showToast("خطأ في الاتصال", "error");
    }
  };

  return (
    <DoctorLayout>
      <ToastContainer />
      <div className="h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 text-gray-900 dark:text-gray-100 [&_div.bg-white]:dark:bg-zinc-900 [&_div.bg-white]:dark:border-zinc-800">
        {socketMismatch && (
          <div className="mb-4 rounded-lg border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <strong>جلسة Socket غير متطابقة</strong>
                <div className="mt-1">هوية الاتصال بـSocket لا تتطابق مع المستخدم المسجّل. الرجاء إعادة تسجيل الدخول أو المحاولة مرة أخرى.</div>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded bg-white px-3 py-1 text-sm font-medium text-red-700 border border-red-200"
                  onClick={() => window.location.reload()}
                >إعادة المحاولة</button>
                <button
                  className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white"
                  onClick={() => router.push(`/${locale}/login`)}
                >إعادة تسجيل الدخول</button>
              </div>
            </div>
          </div>
        )}
        <div className="mx-auto h-full max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaComments className="text-blue-600" />
              {t("title")}
            </h1>
            <p className="mt-2 text-gray-600">{t("subtitle")}</p>
          </div>

          {/* Chat Container */}
          <div className="flex h-[calc(100%-120px)] gap-6 overflow-hidden">
            {/* Left Sidebar */}
            <div className="flex w-80 shrink-0 flex-col rounded-xl bg-white shadow-lg border border-gray-100">
              <div className="border-b border-gray-200 p-4">
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-10 pl-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredPatients.map((patient) => {
                  const conv = patientIdToConversation[patient.id];
                  return (
                    <div
                      key={patient.id}
                      onClick={() => conv ? setSelectedChat(conv.id) : null}
                      className={`cursor-pointer border-b border-gray-100 p-4 transition-all hover:bg-gray-50 ${conv && selectedChat === conv.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">{conv?.avatar || "👤"}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">{patient.fullName}</h3>
                            <span className="text-xs text-gray-500">{conv?.lastMessageTime || ""}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600 truncate">{conv?.lastMessage || ""}</p>
                            {!conv && (
                              <button
                                className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 border border-blue-200 hover:bg-blue-200"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const res = await fetch(`/api/chat/patient`, {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      credentials: "include",
                                      body: JSON.stringify({ patientId: patient.id })
                                    });
                                    const data = await res.json();
                                    if (res.ok && data.chat) {
                                      setConversations((prev) => [...prev, {
                                        id: data.chat.id,
                                        patientId: patient.id,
                                        patientName: patient.fullName,
                                        lastMessage: "",
                                        lastMessageTime: "",
                                        unreadCount: 0,
                                        online: false,
                                        avatar: "👨"
                                      }]);
                                      setSelectedChat(data.chat.id);
                                    } else {
                                      showToast(data.error || "تعذر بدء المحادثة", "error");
                                    }
                                  } catch { showToast("تعذر بدء المحادثة", "error"); }
                                }}
                              >بدء محادثة جديدة</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Chat Window */}
            <div className="flex flex-1 flex-col rounded-xl bg-white shadow-lg border border-gray-100">
              {currentChat ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">{currentChat.avatar}</div>
                        {currentChat.online && <FaCircle className="absolute bottom-0 left-0 text-xs text-green-500 bg-white rounded-full" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{currentChat.patientName}</h3>
                        <p className="text-sm text-gray-600">{currentChat.online ? t("online") : t("offline")}</p>
                        {currentChat && typingUsers[currentChat.patientId] && (
                          <p className="text-xs text-gray-500">{t('typing') || '...typing'}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleVoiceCall} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600"><FaPhone /></button>
                      <button onClick={handleVideoCall} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600"><FaVideo /></button>
                      <ChatActionsPopover onDelete={deleteSelectedChat} confirmText={locale==="ar"?"هل تريد حذف المحادثة؟":"Delete conversation?"} confirmYes={locale==="ar"?"حذف":"Delete"} confirmNo={locale==="ar"?"إلغاء":"Cancel"} />
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="space-y-4">
                      {currentMessages.map((msg, idx) => (
                        <div key={`${msg.clientKey || msg.id}-${idx}`} className={`flex ${msg.sender==="doctor"?"justify-start":"justify-end"}`}>
                          <div className={`max-w-md rounded-2xl px-4 py-3 ${msg.sender==="doctor"?"bg-blue-600 text-white rounded-tr-sm":"bg-white text-gray-900 rounded-tl-sm shadow-md"}`}>
                            <p className="text-sm">{msg.text}</p>
                            <div className={`mt-1 flex items-center justify-end gap-1 text-xs ${msg.sender==="doctor"?"text-blue-100":"text-gray-500"}`}>
                              <span>{msg.time}</span>
                                      {msg.sender==="doctor" && (msg.status==="sent"?<FaCheck/>:msg.status==="delivered"?<FaCheckDouble/>:msg.status==="read"?<FaCheckDouble className="text-blue-300"/>:null)}
                                      {msg.sender==="doctor" && msg.status === 'failed' && (
                                        <button onClick={() => {
                                          // retry upload for this message
                                          try {
                                            const retryEvt = new CustomEvent('chat:retry-upload', { detail: { chatId: msg.chatId, messageId: msg.id } });
                                            window.dispatchEvent(retryEvt);
                                          } catch (e) { console.error(e); }
                                        }} className="ml-2 text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">{safeT('retry','Retry')}</button>
                                      )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <button onClick={handleAttachment} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600"><FaPaperclip /></button>
                      <div className="flex-1">
                        {uploadProgress.uploading && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-600">{uploadProgress.filename} — {uploadProgress.percent}%</div>
                            <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
                              <div className="h-2 bg-blue-600" style={{ width: `${uploadProgress.percent}%` }} />
                            </div>
                          </div>
                        )}
                        <input
                        type="text"
                        placeholder={t("messageInput")}
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value);
                          try {
                            if (socket?.connected && selectedChat) {
                              socket.sendTyping(selectedChat, true);
                              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                              typingTimeoutRef.current = setTimeout(() => socket.sendTyping(selectedChat, false), 1500);
                            }
                          } catch {}
                        }}
                        onKeyPress={(e)=>e.key==="Enter" && handleSendMessage()}
                        className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      </div>
                      <button onClick={handleSendMessage} className="rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700"><FaPaperPlane /></button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <FaComments className="mx-auto mb-4 text-6xl text-gray-300" />
                    <p className="text-lg text-gray-600">اختر محادثة لبدء الدردشة</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}

"use client";

import DoctorLayout from "../DoctorLayout";
import { useToast } from "../../../components/ui/Toast";
import { useEffect, useMemo, useState, useRef } from "react";
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
  FaUser,
  FaPhone,
  FaVideo,
  FaEllipsisV,
  FaImage,
  FaFile,
  FaSmile,
  FaCheck,
  FaCheckDouble,
} from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function Page() {
  const { showToast, ToastContainer } = useToast();
  const t = useTranslations("doctorChat");
  const safeT = (key, fallback) => {
    try {
      return t(key);
    } catch (e) {
      return fallback;
    }
  };
  // Note: use direct fallback strings for toast messages to avoid missing-translation errors
  const router = useRouter();
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");

  const [conversations, setConversations] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [messagesMap, setMessagesMap] = useState({}); // chatId -> messages[]
  const [loadingChats, setLoadingChats] = useState(true);
  const socket = useSocket();
  const typingTimeoutRef = useRef(null);
  const [socketMismatch, setSocketMismatch] = useState(false);
  const [jwtToken, setJwtToken] = useState(null);

  // Fetch JWT token on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/token', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (mounted && data && data.token) setJwtToken(data.token);
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadChatsAndPatients() {
      try {
        // جلب المحادثات النشطة
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
        // avoid reading `selectedChat` here to prevent unnecessary deps
        setSelectedChat((prev) => prev ?? (convs.length ? convs[0].id : null));

        // جلب جميع المرضى للطبيب
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
    return () => (mounted = false);
  }, [t, router, locale, showToast]);

    // replace polling with Socket.io real-time updates when available
    useEffect(() => {
      if (!selectedChat) return;
      let mounted = true;
      let cleanupFns = [];

      (async () => {
        // load messages once
        try {
          const res = await fetch(`/api/chat/${selectedChat}/messages`, { credentials: "include" });
          const data = await res.json();
          if (!res.ok) {
            showToast(data.error || "خطأ في جلب الرسائل", "error");
            return;
          }
          if (!mounted) return;
          const genKey = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `k-${Math.random().toString(36).slice(2,9)}-${Date.now()}`);
          const mapped = (data.messages || []).map((msg) => {
            const hasServerId = msg.id && !String(msg.id).startsWith('tmp-');
            const clientKey = hasServerId ? msg.id : (msg.clientKey || genKey());
            return { ...msg, time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : "", clientKey };
          });
          setMessagesMap((prev) => ({ ...prev, [selectedChat]: mapped }));
        } catch (e) {
          console.error(e);
          showToast("خطأ في الاتصال", "error");
        }

        // connect socket and join room (validate socket identity matches HTTP identity)
        try {
          const s = socket.connect(jwtToken ? { token: jwtToken } : {});
          if (s) {
            // ask socket who it is (server debug helper)
            const whoamiPromise = new Promise((resolve) => {
              const handler = (m) => {
                try { s.off('me', handler); } catch (e) {}
                resolve(m);
              };
              s.on('me', handler);
              try { s.emit('whoami'); } catch (e) { resolve({ error: 'emit_failed' }); }
              // timeout fallback
              setTimeout(() => { try { s.off('me', handler); } catch (e) {} ; resolve({ error: 'timeout' }); }, 2000);
            });

            // also get HTTP identity from server
            let httpIdentity = null;
            try {
              const r = await fetch('/api/auth/whoami', { credentials: 'include' });
              if (r.ok) httpIdentity = await r.json();
            } catch (e) {
              // ignore - we'll treat as mismatch
              console.warn('whoami fetch failed', e);
            }

            const socketIdentity = await whoamiPromise;
            const socketIdMatch = socketIdentity && socketIdentity.id && httpIdentity && httpIdentity.id && socketIdentity.id === httpIdentity.id;
            if (!socketIdMatch) {
              setSocketMismatch(true);
              showToast('Socket identity does not match the logged-in user. Re-login or use same account.', 'error');
            } else {
              setSocketMismatch(false);
              socket.join(selectedChat);
            }
          }

          // message handler
          const offMsg = socket.onMessage((msg) => {
            if (!msg) return;
            const genKey2 = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `k-${Math.random().toString(36).slice(2,9)}-${Date.now()}`);
            const hasServerId = msg.id && !String(msg.id).startsWith('tmp-');
            const normalized = { ...msg, time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : msg.time || '', clientKey: hasServerId ? msg.id : (msg.clientKey || genKey2()) };
            setMessagesMap((prev) => {
              const prevList = prev[selectedChat] || [];
              // تحقق من وجود الرسالة عبر id أو clientKey أو النص والوقت
              const exists = prevList.some((m) =>
                (normalized.id && m.id === normalized.id) ||
                (normalized.clientKey && m.clientKey === normalized.clientKey) ||
                (m.text === normalized.text && m.time === normalized.time && m.sender === normalized.sender)
              );
              if (exists) return prev;
              const next = [...prevList, normalized];
              return { ...prev, [selectedChat]: next };
            });
          });
          cleanupFns.push(offMsg);

          const offTyping = socket.onTyping((t) => {
            // show typing indicator per user (simplified)
            // You can implement UI state to reflect typing users
          });
          cleanupFns.push(offTyping);

          const offPres = socket.onPresence((p) => {
            // update presence for participant
            setConversations((cs) => cs.map((c) => (c.id === selectedChat ? { ...c, online: p.online } : c)));
          });
          cleanupFns.push(offPres);
        } catch (e) {
          // socket connect errors are non-fatal
          console.warn('socket connect error', e);
        }
      })().catch((e) => console.warn('socket effect error', e));

      return () => {
        mounted = false;
        cleanupFns.forEach((fn) => fn && fn());
        // leave socket room
        try { socket.leave(selectedChat); } catch (e) {}
      };
    }, [selectedChat, jwtToken, showToast, socket]);

  const currentChat = conversations.find((c) => c.id === selectedChat);
  const currentMessages = messagesMap[selectedChat] || [];

  const messagesContainerRef = useRef(null);

  // auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    // scroll to bottom smoothly
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } catch (e) {
      el.scrollTop = el.scrollHeight;
    }
  }, [currentMessages.length, selectedChat]);

  // بناء قائمة شاملة: كل المرضى مع ربط المحادثة إن وجدت
  const filteredPatients = allPatients
    .filter((p) => p.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
  const patientIdToConversation = Object.fromEntries(conversations.map(c => [c.patientId, c]));

  // دالة مساعدة لتحديد إذا كان النص رابط صورة
  const isImageUrl = (text) => {
    return typeof text === 'string' && text.match(/^\/uploads\/.*\.(jpg|jpeg|png|gif|webp)$/i);
  };

  // ...existing code...
  // دالة إرسال الرسالة (يجب أن تكون معرفة قبل استخدامها في JSX)
  const handleSendMessage = () => {
    if (!messageInput.trim()) {
      showToast("الرسالة فارغة", "error");
      return;
    }
    // optimistic UI + send via socket if available
    const tempId = `tmp-${Date.now()}`;
    const tempMsg = { id: tempId, chatId: selectedChat, sender: "doctor", text: messageInput, status: "sent", time: new Date().toLocaleTimeString(), clientKey: tempId };
    setMessagesMap((m) => ({ ...m, [selectedChat]: [...(m[selectedChat] || []), tempMsg] }));
    setConversations((cs) => cs.map((c) => (c.id === selectedChat ? { ...c, lastMessage: messageInput } : c)));
    const textToSend = messageInput;
    setMessageInput("");

    if (socket && socket.connected) {
      socket.sendMessage({ chatId: selectedChat, text: textToSend }, (res) => {
        if (res && res.ok && res.message) {
          // replace temp message with authoritative message
          setMessagesMap((m) => {
            const list = (m[selectedChat] || []).filter((x) => x.id !== tempId);
            return { ...m, [selectedChat]: [...list, { ...res.message, time: res.message.createdAt ? new Date(res.message.createdAt).toLocaleTimeString() : "" }] };
          });
        } else {
          // remove temp message on error
          setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).filter((x) => x.id !== tempId) }));
          showToast((res && res.error) || "خطأ عند إرسال الرسالة", "error");
        }
      });
    } else {
      // fallback to HTTP POST
      (async () => {
        try {
          const res = await fetch(`/api/chat/${selectedChat}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text: textToSend }),
          });
          const data = await res.json();
          if (!res.ok) {
            showToast(data.error || "خطأ عند إرسال الرسالة", "error");
            setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).filter((x) => x.id !== tempId) }));
            return;
          }
          // replace temp message by fetching authoritative list
          const res2 = await fetch(`/api/chat/${selectedChat}/messages`, { credentials: "include" });
          const refreshed = await res2.json();
          if (res2.ok) {
            const mapped = (refreshed.messages || []).map((msg) => ({ ...msg, time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : "" }));
            setMessagesMap((m) => ({ ...m, [selectedChat]: mapped }));
          }
          showToast("تم إرسال الرسالة", "success");
        } catch (e) {
          console.error(e);
          showToast("خطأ في الاتصال", "error");
          setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).filter((x) => x.id !== tempId) }));
        }
      })();
    }
  };

  // ...existing code...

  // JSX لعرض الرسائل مع دعم الصور والروابط:
  // ضع هذا الكود في مكان عرض الرسائل:
  //
  <div ref={messagesContainerRef} className="messages-list">
    {currentMessages.map((msg) => (
      <div key={msg.clientKey || msg.id} className="message">
        {isImageUrl(msg.text) ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={msg.text} alt="صورة مرفقة" style={{maxWidth: '200px', maxHeight: '200px', borderRadius: '8px'}} />
        ) : msg.text.match(/^https?:\/\//) ? (
          <a href={msg.text} target="_blank" rel="noopener noreferrer">{msg.text}</a>
        ) : (
          msg.text
        )}
      </div>
    ))}
  </div>

  const handleAttachment = () => {
    // فتح نافذة اختيار ملف
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      // رفع الملف إلى الخادم
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`/api/chat/${selectedChat}/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          showToast(data.error || 'فشل رفع الملف', 'error');
          return;
        }
        // إرسال رابط الملف كرسالة
        if (socket && socket.connected) {
          socket.sendMessage({ chatId: selectedChat, text: data.url }, (res) => {
            if (res && res.ok) {
              showToast('تم إرسال الملف بنجاح', 'success');
            } else {
              showToast('فشل إرسال الملف', 'error');
            }
          });
        } else {
          // fallback: إرسال عبر HTTP
          await fetch(`/api/chat/${selectedChat}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ text: data.url }),
          });
          showToast('تم إرسال الملف بنجاح', 'success');
        }
      } catch (e) {
        showToast('خطأ في رفع الملف', 'error');
      }
    };
    input.click();
  };

  const handleVoiceCall = () => {
    showToast("بدء مكالمة صوتية", "info");
  };

  const handleVideoCall = () => {
    showToast("بدء مكالمة فيديو", "info");
  };

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
      setMessagesMap((m) => {
        const copy = { ...m };
        delete copy[selectedChat];
        return copy;
      });
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
      <div
        className={`h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 text-gray-900 dark:text-gray-100
        [&_div.bg-white]:dark:bg-zinc-900 [&_div.bg-white]:dark:border-zinc-800
        [&_p.text-gray-900]:dark:text-white [&_p.text-gray-600]:dark:text-gray-300 [&_p.text-gray-500]:dark:text-gray-400
        [&_span.text-gray-900]:dark:text-white [&_span.text-gray-600]:dark:text-gray-300
        [&_input.bg-white]:dark:bg-zinc-900 [&_input.border-gray-300]:dark:border-zinc-700 [&_input.text-gray-900]:dark:text-gray-100`}
      >
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
                  onClick={async () => {
                    try {
                      // attempt quick recheck
                      const s = socket.connect();
                      if (!s) return;
                      const who = await new Promise((resolve) => {
                        const h = (m) => { try { s.off('me', h); } catch(e){}; resolve(m); };
                        s.on('me', h);
                        try { s.emit('whoami'); } catch (e) { resolve({ error: 'emit_failed' }); }
                        setTimeout(() => { try { s.off('me', h); } catch(e){}; resolve({ error: 'timeout' }); }, 2000);
                      });
                      const r = await fetch('/api/auth/whoami', { credentials: 'include' });
                      const http = r.ok ? await r.json() : null;
                      if (who && who.id && http && http.id && who.id === http.id) {
                        showToast('تمت المصادقة بنجاح عبر Socket', 'success');
                        setSocketMismatch(false);
                        socket.join(selectedChat);
                      } else {
                        showToast('ما زالت الهوية غير متطابقة', 'error');
                      }
                    } catch (e) {
                      console.warn(e);
                      showToast('فشل في إعادة المحاولة', 'error');
                    }
                  }}
                >
                  إعادة المحاولة
                </button>
                <button
                  className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white"
                  onClick={() => router.push(`/${locale}/login`)}
                >
                  إعادة تسجيل الدخول
                </button>
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
        </div>          {/* Chat Container */}
          <div className="flex h-[calc(100%-120px)] gap-6 overflow-hidden">
            {/* Left Sidebar - Conversations List */}
            <div className="flex w-80 shrink-0 flex-col rounded-xl bg-white shadow-lg border border-gray-100">
              {/* Search */}
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

              {/* قائمة جميع المرضى مع المحادثات */}
              <div className="flex-1 overflow-y-auto">
                {filteredPatients.map((patient) => {
                  const conv = patientIdToConversation[patient.id];
                  return (
                    <div
                      key={patient.id}
                      onClick={() => conv ? setSelectedChat(conv.id) : null}
                      className={`cursor-pointer border-b border-gray-100 p-4 transition-all hover:bg-gray-50 ${
                        conv && selectedChat === conv.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
                            {conv?.avatar || "👤"}
                          </div>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">{patient.fullName}</h3>
                            <span className="text-xs text-gray-500">{conv?.lastMessageTime || ""}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600 truncate">{conv?.lastMessage || ""}</p>
                            {conv ? (
                              conv.unreadCount > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                  {conv.unreadCount}
                                </span>
                              )
                            ) : (
                              <button
                                className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 border border-blue-200 hover:bg-blue-200"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  // إنشاء محادثة جديدة للطبيب والمريض
                                  try {
                                    const res = await fetch(`/api/chat/doctor`, {
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
                                  } catch (err) {
                                    showToast("تعذر بدء المحادثة", "error");
                                  }
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
                          {currentChat.avatar}
                        </div>
                        {currentChat.online && (
                          <FaCircle className="absolute bottom-0 left-0 text-xs text-green-500 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{currentChat.patientName}</h3>
                        <p className="text-sm text-gray-600">
                          {currentChat.online ? t("online") : t("offline")}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleVoiceCall}
                        className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-blue-600"
                        title={t("actions.call")}
                      >
                        <FaPhone className="text-lg" />
                      </button>
                      <button
                        onClick={handleVideoCall}
                        className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-blue-600"
                        title={t("actions.video")}
                      >
                        <FaVideo className="text-lg" />
                      </button>
                      <ChatActionsPopover
                        onDelete={deleteSelectedChat}
                        confirmText={
                          locale === "ar"
                            ? "هل تريد حذف المحادثة؟"
                            : locale === "en"
                            ? "Delete conversation?"
                            : safeT("confirmDelete", "Delete conversation?")
                        }
                        confirmYes={locale === "ar" ? "حذف" : locale === "en" ? "Delete" : safeT("yes", "Delete")}
                        confirmNo={locale === "ar" ? "إلغاء" : locale === "en" ? "Cancel" : safeT("no", "Cancel")}
                      />
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="space-y-4">
                      {currentMessages.map((msg, idx) => (
                        <div
                          key={`${msg.renderId || msg.id || 'msg'}-${idx}`}
                          className={`flex ${msg.sender === "doctor" ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-md rounded-2xl px-4 py-3 ${
                              msg.sender === "doctor"
                                ? "bg-blue-600 text-white rounded-tr-sm"
                                : "bg-white text-gray-900 rounded-tl-sm shadow-md"
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <div
                              className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                                msg.sender === "doctor" ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              <span>{msg.time}</span>
                              {msg.sender === "doctor" && (
                                <>
                                  {msg.status === "sent" && <FaCheck />}
                                  {msg.status === "delivered" && <FaCheckDouble />}
                                  {msg.status === "read" && <FaCheckDouble className="text-blue-300" />}
                                </>
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
                      <button
                        onClick={handleAttachment}
                        className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-blue-600"
                        title={t("actions.attachment")}
                      >
                        <FaPaperclip className="text-xl" />
                      </button>

                      <input
                        type="text"
                        placeholder={t("messageInput")}
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value);
                          // typing indicator
                          try {
                            if (socket && socket.connected && selectedChat) {
                              socket.sendTyping(selectedChat, true);
                              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                              typingTimeoutRef.current = setTimeout(() => {
                                try { socket.sendTyping(selectedChat, false); } catch (e) {}
                              }, 1500);
                            }
                          } catch (e) {}
                        }}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />

                      <button
                        onClick={handleSendMessage}
                        className="rounded-lg bg-blue-600 p-3 text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        title={t("actions.send")}
                      >
                        <FaPaperPlane />
                      </button>
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

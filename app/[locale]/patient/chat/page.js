"use client";

import { useEffect, useState, useRef } from "react";
import ChatActionsPopover from "../../../components/chat/ChatActionsPopover.client";
import useSocket from "../../../components/chat/useSocket.client";
import { useToast } from "../../../components/ui/Toast";
import { FaSearch, FaUserMd, FaPaperPlane, FaPhone, FaVideo, FaPaperclip, FaEllipsisV, FaCircle, FaCheck, FaCheckDouble } from "react-icons/fa";
import useLocale from "../../../hooks/useLocale";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function PatientChatPage() {
  const { locale } = useLocale();
  const { showToast, ToastContainer } = useToast();
    const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");

  const [conversations, setConversations] = useState([]);
  const [messagesMap, setMessagesMap] = useState({});
  const socket = useSocket();
  const typingTimeoutRef = useRef(null);
  const [socketMismatch, setSocketMismatch] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadChats() {
      try {
        const res = await fetch("/api/chat/patient", { credentials: "include" });
        if (res.status === 403) {
          showToast("ليس لديك إذن لعرض هذه الصفحة — جاري إعادة التوجيه.", "error");
          router.push(`/${locale}/doctor/chat`);
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || "خطأ في جلب المحادثات", "error");
          return;
        }
        const convs = (data.chats || []).map((c) => ({
          id: c.id,
          doctorName: c.doctor?.user?.fullName || "الطبيب",
          specialty: c.doctor?.user?.specialty || "",
          avatar: "👩‍⚕️",
          lastMessage: c.messages?.[0]?.text || "",
          lastMessageTime: c.messages?.[0]?.createdAt ? new Date(c.messages[0].createdAt).toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG") : "",
          unreadCount: 0,
          isOnline: false,
        }));
        if (!mounted) return;
        setConversations(convs);
        if (convs.length) setSelectedChat(convs[0].id);
      } catch (e) {
        console.error(e);
        showToast("خطأ في الاتصال", "error");
      }
    }
    loadChats();
    return () => (mounted = false);
  }, [locale, router, showToast]);

  useEffect(() => {
    if (!selectedChat) return;
    let mounted = true;
    let cleanupFns = [];

    (async () => {
      // initial load
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
              return { ...msg, time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG") : "", clientKey };
            });
        setMessagesMap((prev) => ({ ...prev, [selectedChat]: mapped }));
      } catch (e) {
        console.error(e);
        showToast("خطأ في الاتصال", "error");
      }

      // connect socket and join room after validating identity
      try {
        const s = socket.connect();
        if (s) {
          // whoami via socket and HTTP
          const whoamiPromise = new Promise((resolve) => {
            const handler = (m) => {
              try { s.off('me', handler); } catch (e) {}
              resolve(m);
            };
            s.on('me', handler);
            try { s.emit('whoami'); } catch (e) { resolve({ error: 'emit_failed' }); }
            setTimeout(() => { try { s.off('me', handler); } catch (e) {} ; resolve({ error: 'timeout' }); }, 2000);
          });

          let httpIdentity = null;
          try {
            const r = await fetch('/api/auth/whoami', { credentials: 'include' });
            if (r.ok) httpIdentity = await r.json();
          } catch (e) { console.warn('whoami fetch failed', e); }

          const socketIdentity = await whoamiPromise;
          const socketIdMatch = socketIdentity && socketIdentity.id && httpIdentity && httpIdentity.id && socketIdentity.id === httpIdentity.id;
          if (!socketIdMatch) {
            setSocketMismatch(true);
            showToast('Socket identity mismatch — please re-login or use same account.', 'error');
          } else {
            setSocketMismatch(false);
            socket.join(selectedChat);
          }
        }

        const offMsg = socket.onMessage((msg) => {
          if (!msg) return;
          const genKey2 = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `k-${Math.random().toString(36).slice(2,9)}-${Date.now()}`);
          const hasServerId = msg.id && !String(msg.id).startsWith('tmp-');
          const normalized = { ...msg, time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG") : msg.time || '', clientKey: hasServerId ? msg.id : (msg.clientKey || genKey2()) };

          setMessagesMap((prev) => {
            const prevList = prev[selectedChat] || [];

            // 1) If a message with same server id exists, skip
            if (normalized.id && prevList.some((m) => m.id === normalized.id)) return prev;

            // 2) If a message with same clientKey exists (optimistic), skip
            if (normalized.clientKey && prevList.some((m) => m.clientKey && m.clientKey === normalized.clientKey)) return prev;

            // 3) Fallback dedupe: same sender + same text + similar time
            if (normalized.text) {
              const match = prevList.find((m) => m.sender === normalized.sender && m.text === normalized.text && Math.abs(new Date((m.createdAt || m.createdAt) || 0) - new Date((msg.createdAt || msg.createdAt) || 0)) < 2000);
              if (match) return prev;
            }

            return { ...prev, [selectedChat]: [...prevList, normalized] };
          });
        });
        cleanupFns.push(offMsg);

        const offTyping = socket.onTyping((t) => {
          // handle typing indicator if needed
        });
        cleanupFns.push(offTyping);

        const offPres = socket.onPresence((p) => {
          setConversations((cs) => cs.map((c) => (c.id === selectedChat ? { ...c, isOnline: p.online } : c)));
        });
        cleanupFns.push(offPres);
      } catch (e) {
        console.warn('socket connect error', e);
      }
    })().catch((e) => console.warn('socket effect error', e));

    return () => {
      mounted = false;
      cleanupFns.forEach((fn) => fn && fn());
      try { socket.leave(selectedChat); } catch (e) {}
    };
  }, [selectedChat, locale, showToast, socket]);

  // If you want to use translations, keep only one declaration for labels
  const t = useTranslations("patientChat");
  const safeT = (key, fallback) => {
    try {
      return t(key);
    } catch (e) {
      return fallback;
    }
  };
  const labels = {
    pageTitle: t("pageTitle"),
    searchPlaceholder: t("searchPlaceholder"),
    online: t("online"),
    offline: t("offline"),
    unreadBadge: t("unreadBadge"),
    typing: t("typing"),
    sent: t("sent"),
    delivered: t("delivered"),
    read: t("read"),
    messagePlaceholder: t("messagePlaceholder"),
    sendButton: t("sendButton"),
    attachButton: t("attachButton"),
    pressEnter: t("pressEnter"),
    voiceCall: t("voiceCall"),
    videoCall: t("videoCall"),
    moreOptions: t("moreOptions"),
    emptyStateTitle: t("emptyStateTitle"),
    emptyStateDescription: t("emptyStateDescription"),
    toast: {
      messageSent: t("messageSent"),
      voiceCallSoon: t("voiceCallSoon"),
      videoCallSoon: t("videoCallSoon"),
      attachFileSoon: t("attachFileSoon")
    },
    now: t("now"),
    yesterday: t("yesterday"),
    today: t("today"),
    // ...add all other keys as needed...
  };
  

  const currentConversation = conversations.find(c => c.id === selectedChat);
  const currentMessages = messagesMap[selectedChat] || [];

  const messagesContainerRef = useRef(null);

  // auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } catch (e) {
      el.scrollTop = el.scrollHeight;
    }
  }, [currentMessages.length, selectedChat]);

  const filteredConversations = conversations.filter(conv =>
    conv.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    // optimistic UI
    const tempId = `tmp-${Date.now()}`;
    const tempMsg = { id: tempId, chatId: selectedChat, sender: "patient", text: messageInput, status: "sent", time: new Date().toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG"), clientKey: tempId };
    setMessagesMap((m) => ({ ...m, [selectedChat]: [...(m[selectedChat] || []), tempMsg] }));
    setConversations((cs) => cs.map(c => c.id === selectedChat ? { ...c, lastMessage: messageInput } : c));
    setMessageInput("");

      if (socket && socket.connected) {
      socket.sendMessage({ chatId: selectedChat, text: messageInput }, (res) => {
        if (res && res.ok && res.message) {
          setMessagesMap((m) => {
            const list = m[selectedChat] || [];
            const serverId = res.message.id;
            // remove optimistic temp message and any duplicate server message that may have arrived via socket event
            const filtered = list.filter((x) => x.id !== tempId && x.id !== serverId);
            const serverMsg = { ...res.message, time: res.message.createdAt ? new Date(res.message.createdAt).toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG") : "" };
            return { ...m, [selectedChat]: [...filtered, serverMsg] };
          });
        } else {
          setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).filter((x) => x.id !== tempId) }));
          showToast((res && res.error) || "خطأ عند إرسال الرسالة", "error");
        }
      });
    } else {
      (async () => {
        try {
          const res = await fetch(`/api/chat/${selectedChat}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text: messageInput }),
          });
          const data = await res.json();
          if (!res.ok) {
            showToast(data.error || "خطأ عند إرسال الرسالة", "error");
            setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).filter((x) => x.id !== tempId) }));
            return;
          }
          const res2 = await fetch(`/api/chat/${selectedChat}/messages`, { credentials: "include" });
          const refreshed = await res2.json();
          if (res2.ok) {
            const mapped = (refreshed.messages || []).map((msg) => ({ ...msg, time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG") : "" }));
            setMessagesMap((m) => ({ ...m, [selectedChat]: mapped }));
          }
          showToast(labels.toast.messageSent, "success");
        } catch (e) {
          console.error(e);
          showToast("خطأ في الاتصال", "error");
          setMessagesMap((m) => ({ ...m, [selectedChat]: (m[selectedChat] || []).filter((x) => x.id !== tempId) }));
        }
      })();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="h-screen bg-gray-50 dark:bg-slate-950 flex">
        {socketMismatch && (
          <div className="absolute top-4 left-1/2 z-50 w-full max-w-3xl -translate-x-1/2 rounded-lg border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <strong>جلسة Socket غير متطابقة</strong>
                <div className="mt-1">هوية الاتصال بـSocket لا تتطابق مع المستخدم الحالي. الرجاء إعادة تسجيل الدخول أو المحاولة مرة أخرى.</div>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded bg-white px-3 py-1 text-sm font-medium text-red-700 border border-red-200"
                  onClick={async () => {
                    try {
                      // force a clean reconnection: disconnect first to clear any stale handshake
                      try { socket.disconnect(); } catch (e) {}

                      // refresh HTTP identity (ensure cookies/session are up-to-date)
                      let http = null;
                      try {
                        const r = await fetch('/api/auth/whoami', { credentials: 'include' });
                        if (r.ok) http = await r.json();
                      } catch (e) { console.warn('whoami fetch failed', e); }

                      const s = socket.connect();
                      if (!s) {
                        showToast('فشل في إنشاء اتصال Socket', 'error');
                        return;
                      }

                      // wait briefly for socket to establish
                      await new Promise((resolve) => {
                        if (s.connected) return resolve();
                        const onConnect = () => { try { s.off('connect', onConnect); } catch(e){}; resolve(); };
                        s.on('connect', onConnect);
                        setTimeout(resolve, 2000);
                      });

                      const who = await new Promise((resolve) => {
                        const h = (m) => { try { s.off('me', h); } catch(e){}; resolve(m); };
                        s.on('me', h);
                        try { s.emit('whoami'); } catch (e) { resolve({ error: 'emit_failed' }); }
                        setTimeout(() => { try { s.off('me', h); } catch(e){}; resolve({ error: 'timeout' }); }, 2000);
                      });

                      if (who && who.id && http && http.id && who.id === http.id) {
                        showToast('تمت المصادقة بنجاح عبر Socket', 'success');
                        setSocketMismatch(false);
                        socket.join(selectedChat);
                      } else {
                        // still mismatched — clear socket and redirect to login to re-establish session
                        try { socket.disconnect(); } catch (e) {}
                        showToast('هوية الجلسة ما زالت غير متطابقة، سيتم إعادة التوجيه لتسجيل الدخول.', 'error');
                        router.push(`/${locale}/login`);
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
        {/* Conversations Sidebar */}
        <div className="w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{labels.pageTitle}</h2>
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={labels.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedChat(conv.id);
                  setConversations(conversations.map(c => 
                    c.id === conv.id ? { ...c, unreadCount: 0 } : c
                  ));
                }}
                className={`p-4 border-b border-gray-200 dark:border-slate-700 cursor-pointer transition-colors ${
                  selectedChat === conv.id
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                      {conv.avatar}
                    </div>
                    {conv.isOnline && (
                      <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {conv.doctorName}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {conv.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {conv.specialty}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-950">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                      {currentConversation.avatar}
                    </div>
                    {currentConversation.isOnline && (
                      <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {currentConversation.doctorName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentConversation.isOnline ? labels.online : labels.offline}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast(labels.toast.voiceCallSoon, "info")}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <FaPhone className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => showToast(labels.toast.videoCallSoon, "info")}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <FaVideo className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <ChatActionsPopover
                    onDelete={async () => {
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
                        showToast(labels.toast.messageSent || "تم حذف المحادثة", "success");
                      } catch (e) {
                        console.error(e);
                        showToast("خطأ في الاتصال", "error");
                      }
                    }}
                    confirmText={
                      locale === "ar"
                        ? (labels.toast.confirmDelete || "هل تريد حذف المحادثة؟")
                        : locale === "en"
                        ? (labels.toast.confirmDelete || "Delete conversation?")
                        : safeT("confirmDelete", "Delete conversation?")
                    }
                    confirmYes={locale === "ar" ? "حذف" : locale === "en" ? "Delete" : safeT("yes", "Delete")}
                    confirmNo={locale === "ar" ? "إلغاء" : locale === "en" ? "Cancel" : safeT("no", "Cancel")}
                  />
                </div>
              </div>

              {/* Messages Area */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentMessages.map((message, idx) => (
                  <div
                    key={
                      message.clientKey || message.renderId || `${message.id || 'msg'}-${message.createdAt ? new Date(message.createdAt).getTime() : 'no-ts'}-${idx}`
                    }
                    className={`flex ${message.sender === "patient" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.sender === "patient"
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-tl-sm shadow"
                      }`}
                    >
                      <p className="text-sm mb-1">{message.text}</p>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span
                          className={`text-xs ${
                            message.sender === "patient"
                              ? "text-blue-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {message.time}
                        </span>
                        {message.sender === "patient" && (
                          <span className="text-white">
                            {message.status === "sent" && <FaCheck className="text-xs" />}
                            {message.status === "delivered" && <FaCheckDouble className="text-xs" />}
                            {message.status === "read" && <FaCheckDouble className="text-xs text-blue-300" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast(labels.toast.attachFileSoon, "info")}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <FaPaperclip className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={labels.messagePlaceholder}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                  >
                    <FaPaperPlane />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {labels.pressEnter}
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {labels.emptyStateTitle}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {labels.emptyStateDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

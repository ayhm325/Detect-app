"use client";

import DoctorLayout from "../DoctorLayout";
import { useToast } from "@/app/components/ui/Toast";
import { useState } from "react";
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

export default function DoctorChatPage() {
  const { showToast, ToastContainer } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageInput, setMessageInput] = useState("");

  const [conversations] = useState([
    {
      id: 1,
      patientName: "محمد أحمد",
      lastMessage: "شكراً دكتور على المتابعة",
      lastMessageTime: "10:30 ص",
      unreadCount: 2,
      online: true,
      avatar: "👨",
    },
    {
      id: 2,
      patientName: "فاطمة علي",
      lastMessage: "متى موعد الفحص القادم؟",
      lastMessageTime: "أمس",
      unreadCount: 0,
      online: false,
      avatar: "👩",
    },
    {
      id: 3,
      patientName: "أحمد خالد",
      lastMessage: "تم استلام النتائج",
      lastMessageTime: "أمس",
      unreadCount: 1,
      online: true,
      avatar: "👨",
    },
    {
      id: 4,
      patientName: "سارة محمود",
      lastMessage: "هل يمكن تغيير الموعد؟",
      lastMessageTime: "الأربعاء",
      unreadCount: 0,
      online: false,
      avatar: "👩",
    },
    {
      id: 5,
      patientName: "عمر حسن",
      lastMessage: "النتائج ممتازة والحمد لله",
      lastMessageTime: "الثلاثاء",
      unreadCount: 0,
      online: false,
      avatar: "👨",
    },
  ]);

  const [messages, setMessages] = useState({
    1: [
      {
        id: 1,
        sender: "patient",
        text: "صباح الخير دكتور، كيف حال نتائج الأشعة؟",
        time: "09:00 ص",
        status: "read",
      },
      {
        id: 2,
        sender: "doctor",
        text: "صباح النور، النتائج جيدة والحمد لله. لا توجد أي مشاكل واضحة.",
        time: "09:15 ص",
        status: "read",
      },
      {
        id: 3,
        sender: "patient",
        text: "الحمد لله، هل أحتاج لمتابعة؟",
        time: "09:20 ص",
        status: "read",
      },
      {
        id: 4,
        sender: "doctor",
        text: "نعم، أفضل متابعة بعد شهر للاطمئنان.",
        time: "09:25 ص",
        status: "read",
      },
      {
        id: 5,
        sender: "patient",
        text: "شكراً دكتور على المتابعة",
        time: "10:30 ص",
        status: "delivered",
      },
    ],
    2: [
      {
        id: 1,
        sender: "patient",
        text: "متى موعد الفحص القادم؟",
        time: "أمس 03:30 م",
        status: "read",
      },
    ],
    3: [
      {
        id: 1,
        sender: "doctor",
        text: "تم استلام نتائج التحليل",
        time: "أمس 11:00 ص",
        status: "read",
      },
      {
        id: 2,
        sender: "patient",
        text: "تم استلام النتائج",
        time: "أمس 11:15 ص",
        status: "sent",
      },
    ],
  });

  const currentChat = conversations.find((c) => c.id === selectedChat);
  const currentMessages = messages[selectedChat] || [];

  const filteredConversations = conversations.filter((conv) =>
    conv.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageInput.trim()) {
      showToast("يرجى كتابة رسالة أولاً", "error");
      return;
    }

    const newMessage = {
      id: currentMessages.length + 1,
      sender: "doctor",
      text: messageInput,
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };

    setMessages({
      ...messages,
      [selectedChat]: [...currentMessages, newMessage],
    });
    setMessageInput("");
    showToast("تم إرسال الرسالة", "success");
  };

  const handleAttachment = () => {
    showToast("ميزة إرفاق الملفات قريباً", "info");
  };

  const handleVoiceCall = () => {
    showToast("جاري بدء المكالمة الصوتية...", "info");
  };

  const handleVideoCall = () => {
    showToast("جاري بدء مكالمة الفيديو...", "info");
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
        <div className="mx-auto h-full max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaComments className="text-blue-600" />
              المحادثات
            </h1>
            <p className="mt-2 text-gray-600">تواصل مع مرضاك</p>
          </div>

          {/* Chat Container */}
          <div className="flex h-[calc(100%-120px)] gap-6 overflow-hidden">
            {/* Left Sidebar - Conversations List */}
            <div className="flex w-80 shrink-0 flex-col rounded-xl bg-white shadow-lg border border-gray-100">
              {/* Search */}
              <div className="border-b border-gray-200 p-4">
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن مريض..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-10 pl-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedChat(conv.id)}
                    className={`cursor-pointer border-b border-gray-100 p-4 transition-all hover:bg-gray-50 ${
                      selectedChat === conv.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
                          {conv.avatar}
                        </div>
                        {conv.online && (
                          <FaCircle className="absolute bottom-0 left-0 text-xs text-green-500 bg-white rounded-full" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conv.patientName}
                          </h3>
                          <span className="text-xs text-gray-500">{conv.lastMessageTime}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                          {conv.unreadCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
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
                          {currentChat.online ? "متصل الآن" : "غير متصل"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleVoiceCall}
                        className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-blue-600"
                        title="مكالمة صوتية"
                      >
                        <FaPhone className="text-lg" />
                      </button>
                      <button
                        onClick={handleVideoCall}
                        className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-blue-600"
                        title="مكالمة فيديو"
                      >
                        <FaVideo className="text-lg" />
                      </button>
                      <button
                        className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100"
                        title="المزيد"
                      >
                        <FaEllipsisV />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="space-y-4">
                      {currentMessages.map((msg) => (
                        <div
                          key={msg.id}
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
                        title="إرفاق ملف"
                      >
                        <FaPaperclip className="text-xl" />
                      </button>

                      <input
                        type="text"
                        placeholder="اكتب رسالتك هنا..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />

                      <button
                        onClick={handleSendMessage}
                        className="rounded-lg bg-blue-600 p-3 text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        title="إرسال"
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
                    <p className="text-lg text-gray-600">اختر محادثة لبدء المراسلة</p>
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

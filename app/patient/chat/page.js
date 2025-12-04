"use client";

import { useState } from "react";
import { useToast } from "@/app/components/ui/Toast";
import { FaSearch, FaUserMd, FaPaperPlane, FaPhone, FaVideo, FaPaperclip, FaEllipsisV, FaCircle, FaCheck, FaCheckDouble } from "react-icons/fa";

export default function PatientChatPage() {
  const { showToast, ToastContainer } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageInput, setMessageInput] = useState("");

  const [conversations, setConversations] = useState([
    {
      id: 1,
      doctorName: "د. سارة أحمد",
      specialty: "أخصائي أشعة",
      avatar: "👩‍⚕️",
      lastMessage: "سأراجع نتائج الأشعة وأرد عليك قريباً",
      lastMessageTime: "10:30 ص",
      unreadCount: 2,
      isOnline: true,
      messages: [
        { id: 1, sender: "patient", text: "صباح الخير دكتورة، متى ستكون نتائج الأشعة جاهزة؟", time: "10:15 ص", status: "read" },
        { id: 2, sender: "doctor", text: "صباح النور، النتائج ستكون جاهزة اليوم بإذن الله", time: "10:20 ص" },
        { id: 3, sender: "patient", text: "شكراً جزيلاً، هل هناك شيء يجب أن أنتبه له؟", time: "10:25 ص", status: "read" },
        { id: 4, sender: "doctor", text: "سأراجع نتائج الأشعة وأرد عليك قريباً", time: "10:30 ص" }
      ]
    },
    {
      id: 2,
      doctorName: "د. محمد علي",
      specialty: "جراح عظام",
      avatar: "👨‍⚕️",
      lastMessage: "يمكنك حجز موعد يوم الخميس",
      lastMessageTime: "أمس",
      unreadCount: 0,
      isOnline: false,
      messages: [
        { id: 1, sender: "patient", text: "مرحباً دكتور، أشعر بألم في الركبة", time: "أمس 3:00 م", status: "read" },
        { id: 2, sender: "doctor", text: "مرحباً، هل الألم مستمر أم يأتي ويذهب؟", time: "أمس 3:15 م" },
        { id: 3, sender: "patient", text: "يزداد عند صعود السلم", time: "أمس 3:20 م", status: "read" },
        { id: 4, sender: "doctor", text: "يمكنك حجز موعد يوم الخميس", time: "أمس 3:30 م" }
      ]
    },
    {
      id: 3,
      doctorName: "د. فاطمة حسن",
      specialty: "طب عام",
      avatar: "👩‍⚕️",
      lastMessage: "تمام، سأكون بانتظارك",
      lastMessageTime: "الأحد",
      unreadCount: 0,
      isOnline: true,
      messages: [
        { id: 1, sender: "patient", text: "دكتورة، موعدنا غداً الساعة 11؟", time: "الأحد 5:00 م", status: "read" },
        { id: 2, sender: "doctor", text: "نعم صحيح، الساعة 11 صباحاً", time: "الأحد 5:10 م" },
        { id: 3, sender: "patient", text: "ممتاز، شكراً", time: "الأحد 5:12 م", status: "read" },
        { id: 4, sender: "doctor", text: "تمام، سأكون بانتظارك", time: "الأحد 5:15 م" }
      ]
    },
    {
      id: 4,
      doctorName: "د. أحمد خالد",
      specialty: "أخصائي قلب",
      avatar: "👨‍⚕️",
      lastMessage: "النتائج ممتازة، استمر على العلاج",
      lastMessageTime: "السبت",
      unreadCount: 0,
      isOnline: false,
      messages: [
        { id: 1, sender: "patient", text: "دكتور، وصلتني نتائج التحاليل", time: "السبت 2:00 م", status: "read" },
        { id: 2, sender: "doctor", text: "رائع، دعني أراجعها", time: "السبت 2:30 م" },
        { id: 3, sender: "patient", text: "هل كل شيء على ما يرام؟", time: "السبت 3:00 م", status: "read" },
        { id: 4, sender: "doctor", text: "النتائج ممتازة، استمر على العلاج", time: "السبت 3:15 م" }
      ]
    },
    {
      id: 5,
      doctorName: "د. ليلى يوسف",
      specialty: "أخصائي أعصاب",
      avatar: "👩‍⚕️",
      lastMessage: "حسناً، سأرسل لك الوصفة",
      lastMessageTime: "الجمعة",
      unreadCount: 1,
      isOnline: true,
      messages: [
        { id: 1, sender: "patient", text: "دكتورة، الدواء انتهى", time: "الجمعة 4:00 م", status: "read" },
        { id: 2, sender: "doctor", text: "كم تبقى من العلبة؟", time: "الجمعة 4:10 م" },
        { id: 3, sender: "patient", text: "حبتين فقط", time: "الجمعة 4:12 م", status: "read" },
        { id: 4, sender: "doctor", text: "حسناً، سأرسل لك الوصفة", time: "الجمعة 4:20 م" }
      ]
    }
  ]);

  const currentConversation = conversations.find(c => c.id === selectedChat);
  const currentMessages = currentConversation?.messages || [];

  const filteredConversations = conversations.filter(conv =>
    conv.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      id: currentMessages.length + 1,
      sender: "patient",
      text: messageInput,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };

    setConversations(conversations.map(conv => {
      if (conv.id === selectedChat) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageInput,
          lastMessageTime: "الآن"
        };
      }
      return conv;
    }));

    setMessageInput("");
    showToast("تم إرسال الرسالة", "success");

    // Simulate doctor typing and response
    setTimeout(() => {
      const doctorReply = {
        id: currentMessages.length + 2,
        sender: "doctor",
        text: "شكراً على رسالتك، سأرد عليك قريباً",
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setConversations(conversations.map(conv => {
        if (conv.id === selectedChat) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage, doctorReply],
            lastMessage: doctorReply.text,
            lastMessageTime: "الآن"
          };
        }
        return conv;
      }));
    }, 2000);
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
        {/* Conversations Sidebar */}
        <div className="w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">المحادثات</h2>
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="بحث عن طبيب..."
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
                      {currentConversation.isOnline ? "متصل الآن" : "غير متصل"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast("مكالمة صوتية قريباً", "info")}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <FaPhone className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => showToast("مكالمة فيديو قريباً", "info")}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <FaVideo className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <FaEllipsisV className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
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
                    onClick={() => showToast("إرفاق ملف قريباً", "info")}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <FaPaperclip className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب رسالتك..."
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
                  اضغط Enter للإرسال
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  اختر محادثة للبدء
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  حدد طبيباً من القائمة لبدء المحادثة
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import React from "react";
import { FaComments } from "react-icons/fa";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function RecentChatsClient() {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const chatsTr = tr.recentChats || {};
  const title = chatsTr.title || (locale === "ar" ? "الدردشات الأخيرة" : "Recent Chats");
  const chats = [
    {
      id: 1,
      doctor: chatsTr.doctor1 || (locale === "ar" ? "د. محمد سالم" : "Dr. Mohamed Salem"),
      patient: chatsTr.patient1 || (locale === "ar" ? "منى عبد الله" : "Mona Abdullah"),
      lastMsg: chatsTr.lastMsg1 || (locale === "ar" ? "تم إرسال النتائج." : "Results sent."),
    },
    {
      id: 2,
      doctor: chatsTr.doctor2 || (locale === "ar" ? "د. ليلى حسن" : "Dr. Laila Hassan"),
      patient: chatsTr.patient2 || (locale === "ar" ? "سعيد حسن" : "Saeed Hassan"),
      lastMsg: chatsTr.lastMsg2 || (locale === "ar" ? "يرجى رفع صورة الأشعة." : "Please upload the X-ray image."),
    },
    {
      id: 3,
      doctor: chatsTr.doctor3 || (locale === "ar" ? "د. سامي يوسف" : "Dr. Sami Youssef"),
      patient: chatsTr.patient3 || (locale === "ar" ? "هالة يوسف" : "Hala Youssef"),
      lastMsg: chatsTr.lastMsg3 || (locale === "ar" ? "تمت مراجعة الحالة." : "Case reviewed."),
    },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-red-100 mt-8">
      <h3 className="font-bold text-lg mb-4 text-red-700">{title}</h3>
      <ul className="space-y-3">
        {chats.map(chat => (
          <li key={chat.id} className="flex items-center gap-2 text-zinc-700">
            <FaComments className="text-yellow-400" />
            <span className="font-bold">{chat.doctor}</span>
            <span className="mx-2 text-zinc-400">→</span>
            <span className="font-bold">{chat.patient}</span>
            <span className="ml-2 text-xs text-zinc-400">{chat.lastMsg}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export default function ChatWithDoctor({ initialMessages = [] }) {
  const t = useTranslations("patient");
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="card-glass rounded-xl border border-(--ui-border) shadow-sm">
      <header className="flex items-center justify-between border-b border-(--ui-border) p-4">
        <h2 className="text-lg font-semibold text-(--ui-foreground)">
          {t("components.chat.title")}
        </h2>
      </header>
      <div className="flex h-96 flex-col">
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[75%] rounded-md px-3 py-2 text-sm ${
                m.role === "patient"
                  ? "ml-auto bg-(--ui-info) text-(--ui-info-foreground)"
                  : "bg-(--ui-surface-2)/60 text-(--ui-foreground)"
              }`}
            >
              <div className="text-xs opacity-75">
                {m.role === "patient"
                  ? t("components.chat.role.patient")
                  : t("components.chat.role.doctor")}
              </div>
              <div>{m.text}</div>
            </div>
          ))}
          {typing && (
            <div className="inline-flex items-center gap-2 rounded-md bg-(--ui-surface-2)/60 px-3 py-2 text-sm text-(--ui-foreground)">
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-(--ui-muted-foreground)/70" />
              <span
                className="inline-block h-2 w-2 animate-bounce rounded-full bg-(--ui-muted-foreground)/70"
                style={{ animationDelay: "0.1s" }}
              />
              <span
                className="inline-block h-2 w-2 animate-bounce rounded-full bg-(--ui-muted-foreground)/70"
                style={{ animationDelay: "0.2s" }}
              />
              <span>{t("components.chat.typing")}</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <form
          className="flex items-center gap-2 border-t border-(--ui-border) p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            setMessages((prev) => [...prev, { role: "patient", text }]);
            setText("");
            // UI-only mock reply
            setTyping(true);
            setTimeout(() => {
              setTyping(false);
              setMessages((prev) => [
                ...prev,
                { role: "doctor", text: t("components.chat.mockReply") },
              ]);
            }, 1000);
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("components.chat.placeholder")}
            className="flex-1 rounded-md border border-(--ui-border) bg-(--ui-surface) px-3 py-2 text-sm text-(--ui-foreground) outline-none placeholder:text-(--ui-muted-foreground) focus:ring-2 focus:ring-(--ui-info)"
          />
          <button className="btn-gradient rounded-md px-3 py-2 text-sm text-white">
            {t("components.chat.send")}
          </button>
        </form>
      </div>
    </section>
  );
}

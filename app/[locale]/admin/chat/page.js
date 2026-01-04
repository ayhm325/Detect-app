"use client";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../../components/ui/Toast";
import {
  FaMagnifyingGlass,
  FaMessage,
  FaTrash,
  FaX,
  FaEye,
} from "react-icons/fa6";
import ChatMessage from "../../../components/admin/ChatMessage";
import { useLocale, useTranslations } from "next-intl";
import { formatDateTime } from "../../../lib/date";

const ADMIN_CHAT_ERROR_CODES = {
  SERVER: "server_error",
  DELETE_FAILED: "delete_failed",
  ATTACHMENT: "__attachment__",
};

function lastMessagePreview(lastMessage) {
  if (!lastMessage) return "";
  if (lastMessage.text) return lastMessage.text;
  if (lastMessage.fileName) return lastMessage.fileName;
  if (lastMessage.fileUrl) return ADMIN_CHAT_ERROR_CODES.ATTACHMENT;
  return "";
}

export default function AdminChatPage() {
  const { showToast, ToastContainer } = useToast();
  const t = useTranslations("adminChat");
  const locale = useLocale();
  const ui = useTranslations("ui");
  const placeholder = ui("placeholder");

  const dateLocale = locale === "ar" ? "ar-EG" : "en-US";

  const labels = {
    title: t("title"),
    subtitle: t("subtitle"),
    searchPlaceholder: t("searchPlaceholder"),
    tablePatient: t("tablePatient"),
    tableDoctor: t("tableDoctor"),
    tableLast: t("tableLast"),
    tableUpdated: t("tableUpdated"),
    tableActions: t("tableActions"),
    view: t("view"),
    delete: t("delete"),
    empty: t("empty"),
    loading: t("loading"),
    deleteTitle: t("deleteTitle"),
    deleteBody: t("deleteBody"),
    cancel: t("cancel"),
    confirmDelete: t("confirmDelete"),
    close: t("close"),
    toastDeleted: t("toastDeleted"),
    toastDeleteFailed: t("toastDeleteFailed"),
    attachment: t("attachment"),
    placeholder,
  };

  const renderError = (value) => {
    const v = String(value || "").trim();
    if (!v) return t("errors.serverError");
    if (v === ADMIN_CHAT_ERROR_CODES.SERVER) return t("errors.serverError");
    if (v === ADMIN_CHAT_ERROR_CODES.DELETE_FAILED) return t("errors.deleteFailed");
    return t("errors.unknown");
  };

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [showConversationModal, setShowConversationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetch("/api/chat/admin")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || ADMIN_CHAT_ERROR_CODES.SERVER);
        return data;
      })
      .then((data) => {
        if (!mounted) return;
        setChats(Array.isArray(data?.chats) ? data.chats : []);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || ADMIN_CHAT_ERROR_CODES.SERVER);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredChats = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => {
      const patientName = (c?.patient?.fullName || "").toLowerCase();
      const patientEmail = (c?.patient?.email || "").toLowerCase();
      const doctorName = (c?.doctor?.user?.fullName || "").toLowerCase();
      const doctorEmail = (c?.doctor?.user?.email || "").toLowerCase();
      return (
        patientName.includes(q) ||
        patientEmail.includes(q) ||
        doctorName.includes(q) ||
        doctorEmail.includes(q)
      );
    });
  }, [chats, searchQuery]);

  async function openChat(chat) {
    setSelectedChat(chat);
    setShowConversationModal(true);
    setMessages([]);
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/chat/${chat.id}/messages`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || ADMIN_CHAT_ERROR_CODES.SERVER);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }

  function requestDelete(chatId) {
    setDeleteId(chatId);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/chat/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(ADMIN_CHAT_ERROR_CODES.DELETE_FAILED);
      setChats((prev) => prev.filter((c) => c.id !== deleteId));
      if (selectedChat?.id === deleteId) {
        setSelectedChat(null);
        setMessages([]);
        setShowConversationModal(false);
      }
      showToast(labels.toastDeleted, "success");
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch {
      showToast(labels.toastDeleteFailed, "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <ToastContainer />
      <div className="px-4 py-6 md:px-8">
        <div className="card-glass p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="brand-gradient grid h-10 w-10 place-items-center rounded-xl text-white">
                  <FaMessage />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">
                    {labels.title}
                  </h1>
                  <p className="text-sm text-(--ui-muted-2)">{labels.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-96">
              <div className="relative">
                <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--ui-muted-2)" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={labels.searchPlaceholder}
                  className="h-11 w-full rounded-xl border border-(--ui-border) bg-(--ui-surface) pl-10 pr-3 text-sm text-foreground outline-none ring-0 focus:border-(--ui-ring) focus:ring-2 focus:ring-(--ui-ring)/20"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-(--ui-border)">
            <table className="min-w-full bg-(--ui-surface)">
              <thead>
                <tr className="bg-(--ui-surface-2) text-(--ui-muted-2)">
                  <th className="px-4 py-3 text-start text-xs font-semibold">{labels.tablePatient}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold">{labels.tableDoctor}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold">{labels.tableLast}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold">{labels.tableUpdated}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold">{labels.tableActions}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-(--ui-muted-2)" colSpan={5}>
                      {labels.loading}
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-(--ui-danger)" colSpan={5}>
                      {renderError(error)}
                    </td>
                  </tr>
                ) : filteredChats.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-sm text-(--ui-muted-2)" colSpan={5}>
                      {labels.empty}
                    </td>
                  </tr>
                ) : (
                  filteredChats.map((c) => {
                    const last = c?.messages?.[0] || null;
                    return (
                      <tr key={c.id} className="border-t border-(--ui-border) hover:bg-(--ui-surface-2)/60">
                        <td className="px-4 py-3 text-sm text-foreground">
                          <div className="font-medium">{c?.patient?.fullName || labels.placeholder}</div>
                          <div className="text-xs text-(--ui-muted-2)">{c?.patient?.email || ""}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          <div className="font-medium">{c?.doctor?.user?.fullName || labels.placeholder}</div>
                          <div className="text-xs text-(--ui-muted-2)">{c?.doctor?.user?.email || ""}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-(--ui-muted-2)">
                          {(() => {
                            const v = lastMessagePreview(last);
                            if (!v) return labels.placeholder;
                            return v === ADMIN_CHAT_ERROR_CODES.ATTACHMENT
                              ? labels.attachment
                              : v;
                          })()}
                        </td>
                        <td className="px-4 py-3 text-sm text-(--ui-muted-2)">
                          {formatDateTime(c?.updatedAt, dateLocale, placeholder)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-xl border border-(--ui-border) bg-(--ui-surface-2) px-3 py-2 text-xs font-semibold text-foreground hover:bg-(--ui-surface-2)/70"
                              onClick={() => openChat(c)}
                            >
                              <FaEye /> {labels.view}
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-xl border border-(--ui-danger-border) bg-(--ui-danger-bg) px-3 py-2 text-xs font-semibold text-(--ui-danger) hover:bg-(--ui-danger-bg)/70"
                              onClick={() => requestDelete(c.id)}
                            >
                              <FaTrash /> {labels.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showConversationModal && selectedChat ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--color-neutral)/50 p-4">
          <div className="card-glass w-full max-w-3xl p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-lg font-bold text-foreground">
                  {(selectedChat?.doctor?.user?.fullName || labels.placeholder)} → {(selectedChat?.patient?.fullName || labels.placeholder)}
                </div>
                <div className="text-sm text-(--ui-muted-2)">
                  {selectedChat?.doctor?.user?.email || ""} • {selectedChat?.patient?.email || ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowConversationModal(false);
                  setSelectedChat(null);
                  setMessages([]);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--ui-border) bg-(--ui-surface) text-(--ui-muted-2) hover:bg-(--ui-surface-2)"
                aria-label={labels.close}
              >
                <FaX />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-4 max-h-[60vh] overflow-y-auto">
              {messagesLoading ? (
                <div className="py-8 text-center text-sm text-(--ui-muted-2)">{labels.loading}</div>
              ) : messages.length === 0 ? (
                <div className="py-8 text-center text-sm text-(--ui-muted-2)">{labels.empty}</div>
              ) : (
                messages.map((m) => (
                  <ChatMessage
                    key={m.id}
                    message={{
                      ...m,
                      time: formatDateTime(m.createdAt, dateLocale, placeholder),
                    }}
                    isDoctor={m.sender === "doctor"}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--color-neutral)/50 p-4">
          <div className="card-glass w-full max-w-md p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-foreground">{labels.deleteTitle}</div>
                <div className="mt-1 text-sm text-(--ui-muted-2)">{labels.deleteBody}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (deleteLoading) return;
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--ui-border) bg-(--ui-surface) text-(--ui-muted-2) hover:bg-(--ui-surface-2)"
                aria-label={labels.close}
              >
                <FaX />
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-xl border border-(--ui-border) bg-(--ui-surface) px-4 py-3 text-sm font-semibold text-foreground hover:bg-(--ui-surface-2)"
                onClick={() => {
                  if (deleteLoading) return;
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl border border-(--ui-danger-border) bg-(--ui-danger) px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {labels.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

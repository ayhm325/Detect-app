"use client";
import { useMemo, useState } from "react";
// Page is rendered inside the route-level AdminLayout; avoid double-wrapping
import { useToast } from "../../../components/ui/Toast";
import {
  FaMagnifyingGlass,
  FaMessage,
  FaTrash,
  FaBoxArchive,
  FaX,
  FaEye,
  FaCheckDouble,
  FaExclamation,
  FaCheck,
} from "react-icons/fa6";
import useLocale from "../../../hooks/useLocale";

export default function AdminChatPage() {
  const { showToast, ToastContainer } = useToast();
  const { t, locale } = useLocale();

  const ac = t.adminChat || {};

  // ...existing code...
  // Remove all label objects and use t("key") for all UI text
  // For example: t("breadcrumbs.home"), t("header.title"), t("stats.total"), t("filters.searchPlaceholder"), t("table.patient"), t("actions.view"), t("empty"), t("conversationModal.messages"), t("deleteModal.title"), t("toast.deleted")

  const breadcrumbs = { ...tr.breadcrumbs, ...(ac.breadcrumbs || {}) };
  const headerLabels = { ...tr.header, ...(ac.header || {}) };
  const statsLabels = { ...tr.stats, ...(ac.stats || {}) };
  const filters = {
    ...tr.filters,
    ...(ac.filters || {}),
    status: { ...tr.filters.status, ...(ac.filters?.status || {}) },
  };
  const tableLabels = { ...tr.table, ...(ac.table || {}) };
  const statusLabels = { ...tr.status, ...(ac.status || {}) };
  const actionLabels = { ...tr.actions, ...(ac.actions || {}) };
  const emptyLabel = ac.empty || tr.empty;
  const conversationLabels = { ...tr.conversationModal, ...(ac.conversationModal || {}) };
  const deleteLabels = { ...tr.deleteModal, ...(ac.deleteModal || {}) };
  const toastLabels = { ...tr.toast, ...(ac.toast || {}) };

  

  const initialConversations = useMemo(() => createInitialConversations(locale), [locale]);
  const [conversations, setConversations] = useState(initialConversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // تصفية المحادثات
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.patientName.includes(searchQuery) ||
      conv.doctorName.includes(searchQuery) ||
      conv.patientId.includes(searchQuery);
    const matchesStatus =
      filterStatus === "all" || conv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // باقي الكود كما هو (إحصائيات، الأحداث، المودالات، الجدول...) 
  // مع استخدام المتغيرات المصححة مثل tr و labels

  return (
    <>
      <ToastContainer />
      {/* باقي الواجهة تبقى كما هي، مع استخدام statusLabels, actionLabels, conversationLabels, deleteLabels, toastLabels */}
    </>
  );
}

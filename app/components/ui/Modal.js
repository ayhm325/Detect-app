"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

export default function Modal({ isOpen, onClose, title, children, size = "md", closeOnOverlay = true }) {
  const t = useTranslations("ui");
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4",
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-(--ui-foreground)/60 backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative ${sizes[size]} w-full bg-(--ui-surface) text-(--ui-foreground) rounded-3xl shadow-2xl border border-(--ui-border) transform transition-all animate-fadeIn`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-(--ui-border)">
            <h2
              id="modal-title"
              className="text-2xl font-bold brand-gradient-text"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-(--ui-surface-2) transition-colors"
              aria-label={t("aria.close")}
            >
              <svg className="w-6 h-6 text-(--ui-muted-foreground)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}

// Confirm Dialog Component
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, variant = "danger" }) {
  const t = useTranslations("ui");
  const resolvedConfirmText = confirmText ?? t("actions.confirm");
  const resolvedCancelText = cancelText ?? t("actions.cancel");

  const variants = {
    danger: "bg-(--ui-danger) text-(--ui-danger-foreground) hover:opacity-90",
    success: "bg-(--ui-success) text-(--ui-success-foreground) hover:opacity-90",
    warning: "bg-(--ui-warning) text-(--ui-warning-foreground) hover:opacity-90",
  };

  const iconWrap = {
    danger: "bg-(--ui-danger-bg) border-(--ui-danger-border)",
    success: "bg-(--ui-success-bg) border-(--ui-success-border)",
    warning: "bg-(--ui-warning-bg) border-(--ui-warning-border)",
  };

  const iconColor = {
    danger: "text-(--ui-danger)",
    success: "text-(--ui-success)",
    warning: "text-(--ui-warning)",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" closeOnOverlay={false}>
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto w-16 h-16 mb-4 rounded-full border flex items-center justify-center ${iconWrap[variant] || iconWrap.danger}`}>
          <svg className={`w-8 h-8 ${iconColor[variant] || iconColor.danger}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-(--ui-foreground) mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-(--ui-muted-foreground) mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-(--ui-surface-2) text-(--ui-foreground) border border-(--ui-border) rounded-full font-semibold hover:bg-(--ui-surface) transition-colors"
          >
            {resolvedCancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 ${variants[variant] || variants.danger} rounded-full font-semibold transition-colors`}
          >
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

"use client";
import React from "react";

export default function Modal({ open, onClose, children, className = "", overlayClass = "", ...props }) {
  if (!open) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-(--color-neutral)/40 p-4 ${overlayClass}`}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full min-w-75 max-w-md rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6 ${className}`}
        onClick={e => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

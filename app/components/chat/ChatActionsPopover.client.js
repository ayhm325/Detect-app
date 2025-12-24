"use client";

import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { FaEllipsisV } from "react-icons/fa";

export default function ChatActionsPopover({ onDelete, confirmText = "هل تريد حذف المحادثة؟", confirmYes = "حذف", confirmNo = "إلغاء" }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const buttonRef = useRef(null);
  const popRef = useRef(null);
  const [pos, setPos] = useState(null); // {top,left}

  useEffect(() => {
    function onDoc(e) {
      if (buttonRef.current && buttonRef.current.contains(e.target)) return;
      if (popRef.current && popRef.current.contains(e.target)) return;
      setOpen(false);
      setConfirming(false);
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("resize", () => setOpen(false));
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("resize", () => setOpen(false));
    };
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const btn = buttonRef.current;
    const pop = popRef.current;
    if (!btn || !pop) return;
    const rect = btn.getBoundingClientRect();

    const popW = pop.offsetWidth;
    const popH = pop.offsetHeight;
    const margin = 8;

    // Determine direction from document (RTL support)
    const dir = document.documentElement?.dir || document.body?.dir || "ltr";

    // Preferred horizontal: align popover right edge to button right edge (ltr), opposite for rtl
    let left;
    if (dir === "rtl") {
      left = rect.left; // align left edge with button left
    } else {
      left = rect.right - popW; // align right edge with button right
    }

    // clamp to viewport
    left = Math.max(margin, Math.min(left, window.innerWidth - popW - margin));

    // vertical: prefer below unless not enough space
    let top = rect.bottom + margin;
    if (top + popH > window.innerHeight - margin) {
      // place above
      top = rect.top - popH - margin;
      if (top < margin) top = margin;
    }

    setPos({ top: Math.round(top), left: Math.round(left) });
  }, [open, confirming]);

  const popup = (
    <div
      ref={popRef}
      style={pos ? { position: "fixed", top: `${pos.top}px`, left: `${pos.left}px`, zIndex: 9999 } : { position: "fixed", visibility: "hidden" }}
    >
      <div className="w-48 rounded-md bg-white shadow-lg border border-gray-200">
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
          >
            حذف المحادثة
          </button>
        ) : (
          <div className="px-4 py-2 text-sm">
            <div className="mb-2">{confirmText}</div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirming(false)} className="px-3 py-1 rounded bg-gray-100 text-sm">
                {confirmNo}
              </button>
              <button
                onClick={async () => {
                  setOpen(false);
                  setConfirming(false);
                  try {
                    await onDelete();
                  } catch (e) {
                    // caller handles errors
                  }
                }}
                className="px-3 py-1 rounded bg-red-600 text-white text-sm"
              >
                {confirmYes}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100"
        title="More"
      >
        <FaEllipsisV />
      </button>
      {open && createPortal(popup, document.body)}
    </div>
  );
}

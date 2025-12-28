"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";

const Toast = ({ message, type = "info", duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: "bg-green-500 dark:bg-green-600",
    error: "bg-red-500 dark:bg-red-600",
    warning: "bg-yellow-500 dark:bg-yellow-600",
    info: "bg-blue-500 dark:bg-blue-600",
  }[type];

  const icon = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  }[type];

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-left z-50 max-w-sm`}>
      <span className="text-xl font-bold">{icon}</span>
      <p className="text-sm md:text-base">{message}</p>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-4 text-white hover:opacity-80"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;

// Hook للاستخدام السهل
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  // Stable showToast so components can safely include it in effect deps
  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    // schedule removal
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, [setToasts]);

  // Stable container component to avoid re-creating component identity
  const ToastContainer = useCallback(() => (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
        />
      ))}
    </>
  ), [toasts]);

  return useMemo(() => ({ showToast, ToastContainer }), [showToast, ToastContainer]);
};

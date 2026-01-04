"use client";
import React from "react";

const Spinner = ({ size = "md", fullScreen = false }) => {
  const sizeClass = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  }[size];

  const spinner = (
    <div className={`${sizeClass} rounded-full animate-spin border-(--ui-ring)/20 border-t-(--ui-ring)`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-(--ui-foreground)/20 flex items-center justify-center z-40">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Spinner;

// Improved Overlay component
export const LoadingOverlay = ({ show = false, message = "" }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-(--ui-foreground)/30 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-(--ui-surface) border border-(--ui-border) rounded-xl shadow-2xl p-8 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-(--ui-ring)/20 border-t-(--ui-ring) rounded-full animate-spin" />
        {message ? (
          <p className="text-(--ui-foreground) font-medium text-center">{message}</p>
        ) : null}
      </div>
    </div>
  );
};

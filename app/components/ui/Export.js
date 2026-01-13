"use client";
import React from "react";
import { FaDownload } from "react-icons/fa";
import { useTranslations } from "next-intl";

export const exportToCSV = (data, filename = "export", { emptyMessage } = {}) => {
  if (!data || data.length === 0) {
    if (emptyMessage) alert(emptyMessage);
    return;
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`;
        }
        return value;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data, filename = "export", { emptyMessage } = {}) => {
  if (!data || data.length === 0) {
    if (emptyMessage) alert(emptyMessage);
    return;
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

// Export button intentionally disabled globally.
// Returning null hides the button everywhere while keeping utility exports available.
const ExportButton = () => null;

export default ExportButton;

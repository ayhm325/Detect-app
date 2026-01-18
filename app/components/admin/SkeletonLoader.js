import React from "react";

export default function SkeletonLoader({ height = 20, width = "100%" }) {
  return (
    <div
      className="bg-(--ui-surface-2)/70 animate-pulse rounded"
      style={{ height, width }}
    />
  );
}

"use client";
// BackgroundWrapper: full-screen animated background using hologram gradient and floating shapes.
import { useTheme } from "../../theme-provider";

export default function BackgroundWrapper({
  children,
  intensity = "mid",
  applyLightGradient = false,
  lightBgColor = null,
  className = "",
  style = undefined,
  ...props
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const intensityMap = {
    low: "opacity-25",
    mid: "opacity-40",
    high: "opacity-60",
  };
  const blobClassBase = `absolute rounded-full blur-2xl floaty-shape ${intensityMap[intensity] || intensityMap.mid}`;
  const isDisabled = intensity === "none";

  const outerStyle =
    !isDark && lightBgColor
      ? { backgroundColor: lightBgColor }
      : applyLightGradient && !isDark
        ? { background: "linear-gradient(180deg, #DFF7E8 0%, #BFE4CC 100%)" }
        : {};

  const mergedStyle = { ...(style || {}), ...(outerStyle || {}) };
  const containerClass = ["relative min-h-screen w-full", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClass} style={mergedStyle} {...props}>
      {!isDisabled && (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 hologram-bg hue-animated"
          />

          <div
            aria-hidden="true"
            className={`${blobClassBase} right-10 top-20 h-56 w-56`}
            style={{ background: "var(--color-secondary)" }}
          />
          <div
            aria-hidden="true"
            className={`${blobClassBase} left-12 bottom-24 h-48 w-48`}
            style={{ background: "var(--color-primary)" }}
          />
          <div
            aria-hidden="true"
            className={`${blobClassBase} left-1/2 top-1/3 h-40 w-40 -translate-x-1/2`}
            style={{ background: "var(--color-accent)" }}
          />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

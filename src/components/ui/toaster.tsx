// src/components/ui/toaster.tsx
"use client";
import { useEffect, useState } from "react";
import { TOAST_EVENT } from "./use-toast";
import { Toast } from "@/types";
import { CheckCircle, XCircle, Info } from "lucide-react";

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Omit<Toast, "id">;
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...detail, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const isDestructive = t.variant === "destructive";
        const isSuccess = t.variant === "success";
        const Icon = isDestructive ? XCircle : isSuccess ? CheckCircle : Info;
        const accent = isDestructive ? "#e53935" : isSuccess ? "#4caf50" : "#e53935";

        return (
          <div
            key={t.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              background: "#111",
              border: `1px solid ${accent}`,
              borderLeft: `3px solid ${accent}`,
              color: "#f0f0f0",
              padding: "14px 18px",
              fontFamily: "var(--font-barlow, sans-serif)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              minWidth: "280px",
              maxWidth: "380px",
              pointerEvents: "all",
              animation: "slideInRight 0.35s ease forwards",
            }}
          >
            <Icon size={16} color={accent} style={{ marginTop: "2px", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "var(--font-barlow-condensed, sans-serif)",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: t.description ? "3px" : 0,
              }}>{t.title}</div>
              {t.description && (
                <div style={{ fontSize: "0.78rem", color: "#888", lineHeight: 1.4 }}>
                  {t.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px) scale(0.96); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

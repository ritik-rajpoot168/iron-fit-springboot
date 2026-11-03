// src/app/error.tsx
"use client";
import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-iron-dark flex flex-col items-center justify-center px-6 text-center">
      <div
        className="w-16 h-16 flex items-center justify-center mb-6"
        style={{ border: "1px solid var(--iron-red)", background: "var(--iron-red-glow)" }}
      >
        <AlertTriangle size={28} className="text-iron-red" />
      </div>
      <h2 className="hero-title text-3xl mb-3">Something Went Wrong</h2>
      <p className="font-body text-iron-gray text-sm mb-8 max-w-sm">
        An unexpected error occurred. Reset the screen and try again.
      </p>
      <button className="btn-primary px-8 py-3 text-xs" onClick={reset}>
        Try Again
      </button>
    </main>
  );
}

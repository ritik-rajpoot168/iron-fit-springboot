// src/app/not-found.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-iron-dark flex flex-col items-center justify-center px-6 text-center">
      <div
        className="font-display font-black leading-none mb-4"
        style={{ fontSize: "clamp(6rem,20vw,14rem)", color: "var(--iron-red)", opacity: 0.15 }}
      >
        404
      </div>
      <h1 className="hero-title text-3xl mb-3">Page Not Found</h1>
      <p className="font-body text-iron-gray text-sm mb-8 max-w-xs">
        This page doesn&apos;t exist. Let&apos;s get you back on track.
      </p>
      <Link href="/" className="btn-outline px-8 py-3 text-xs">
        <ArrowLeft size={13} /> Back to Home
      </Link>
    </main>
  );
}

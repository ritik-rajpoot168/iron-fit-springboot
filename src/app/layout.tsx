// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "IRON.FIT — Earn The Strongest Version of You",
  description:
    "A tactical AI fitness platform with curated programs, an AI coach that builds your week, and progress tracking that doesn't lie.",
  keywords: ["fitness", "workout", "AI coach", "strength training", "HIIT", "workout planner"],
  openGraph: {
    title: "IRON.FIT",
    description: "Earn The Strongest Version of You",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-iron-dark text-iron-white antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

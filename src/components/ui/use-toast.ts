// src/components/ui/use-toast.ts
"use client";
import { ToastVariant } from "@/types";

const TOAST_EVENT = "iron-toast";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: options }));
    }
  };
  return { toast };
}

export { TOAST_EVENT };

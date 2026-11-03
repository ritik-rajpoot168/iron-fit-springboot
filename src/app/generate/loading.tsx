// src/app/generate/loading.tsx
import { Flame } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-iron-dark flex flex-col items-center justify-center gap-6">
      <Flame size={40} className="text-iron-red animate-pulse" />
      <p className="font-display text-2xs tracking-widest uppercase text-iron-gray">
        Loading AI Coach…
      </p>
    </div>
  );
}

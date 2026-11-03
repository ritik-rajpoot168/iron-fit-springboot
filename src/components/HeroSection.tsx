// src/components/HeroSection.tsx
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-end px-6 pb-20 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-[0.18]" />

      {/* Red radial glow */}
      <div
        className="absolute top-0 right-0 w-[55vw] h-[55vw] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(229,57,53,0.1) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[35vw] h-[35vw] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(229,57,53,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Decorative corner lines */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t border-l pointer-events-none"
           style={{ borderColor: "rgba(229,57,53,0.3)" }} />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r pointer-events-none"
           style={{ borderColor: "rgba(229,57,53,0.3)" }} />

      <div className="relative max-w-[1100px] animate-fade-in-up">
        {/* Tag */}
        <div className="section-tag mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-iron-red animate-pulse-dot" />
          AI-Powered Fitness Platform
        </div>

        {/* Headline */}
        <h1 className="hero-title mb-6" style={{ fontSize: "clamp(3.5rem, 10vw, 9rem)" }}>
          EARN THE{" "}
          <span className="text-iron-red">STRONGEST</span>
          <br />
          VERSION OF YOU.
        </h1>

        {/* Subtitle */}
        <p className="font-body text-iron-gray-light max-w-xl text-base leading-relaxed mb-10">
          A tactical workout platform with curated programs, an AI coach that
          builds your week, and progress tracking that doesn&apos;t lie.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 mb-16">
          <Link href="/generate" className="btn-primary px-8 py-4 text-sm">
            Generate My Plan
            <ArrowRight size={15} />
          </Link>
          <Link href="/library" className="btn-outline px-8 py-4 text-sm">
            Browse Library
          </Link>
        </div>

        {/* Social proof strip */}
        <div className="flex flex-wrap items-center gap-6">
          {[
            { value: "10K+", label: "AI-Generated Plans" },
            { value: "5",    label: "Workout Types"      },
            { value: "4",    label: "Goals Supported"    },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="font-display font-black text-2xl text-iron-red">{s.value}</span>
              <span className="font-display text-2xs tracking-widest uppercase text-iron-gray">
                {s.label}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <Zap size={13} className="text-iron-red" />
            <span className="font-display text-2xs tracking-widest uppercase text-iron-gray">
              AI Fitness Engine
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

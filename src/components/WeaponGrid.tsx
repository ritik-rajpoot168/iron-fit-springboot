// src/components/WeaponGrid.tsx  — now "Goal Cards" replacing workout type cards
import Link from "next/link";
import { ArrowRight, Flame, Dumbbell, Repeat, Target } from "lucide-react";

const GOALS = [
  {
    id: "fat-loss",
    label: "Fat Loss",
    icon: Flame,
    tagline: "Burn fat. Stay lean.",
    desc: "Caloric deficit training with optimal cardio and strength splits to maximize fat oxidation.",
    color: "#e53935",
  },
  {
    id: "muscle-gain",
    label: "Muscle Gain",
    icon: Dumbbell,
    tagline: "Lift heavy. Grow strong.",
    desc: "Progressive overload protocols with volume and intensity periodization for maximum hypertrophy.",
    color: "#e53935",
  },
  {
    id: "body-recomposition",
    label: "Body Recomp",
    icon: Repeat,
    tagline: "Burn fat. Build muscle.",
    desc: "Simultaneous fat loss and muscle gain. Advanced programming for body transformation.",
    color: "#e53935",
  },
  {
    id: "general-fitness",
    label: "General Fitness",
    icon: Target,
    tagline: "Move better. Feel stronger.",
    desc: "Balanced programming across strength, cardio, and mobility for overall health.",
    color: "#e53935",
  },
];

export function WeaponGrid() {
  return (
    <section className="py-20 px-6 border-t border-iron">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <div className="section-tag">Train With Purpose</div>
            <h2 className="hero-title text-[clamp(2rem,5vw,3.5rem)]">
              CHOOSE YOUR GOAL
            </h2>
          </div>
          <Link href="/generate" className="btn-outline px-6 py-3 text-xs hidden sm:flex">
            Start AI Coach
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Goal cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "var(--iron-border)" }}>
          {GOALS.map((g) => {
            const Icon = g.icon;
            return (
              <Link
                key={g.id}
                href="/generate"
                className="group block iron-card p-8 transition-all duration-300 hover:bg-iron-card2 no-underline"
                style={{ textDecoration: "none" }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-10 h-10 flex items-center justify-center transition-colors"
                    style={{
                      border: "1px solid var(--iron-border2)",
                      background: "var(--iron-red-glow2)",
                    }}
                  >
                    <Icon size={18} className="text-iron-red" />
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-iron-gray opacity-0 group-hover:opacity-100 group-hover:text-iron-red transition-all duration-200 -translate-x-2 group-hover:translate-x-0"
                  />
                </div>

                <div className="font-display font-black text-2xl uppercase tracking-wide text-iron-white mb-1">
                  {g.label}
                </div>
                <div className="font-display text-xs tracking-widest uppercase text-iron-red mb-4">
                  {g.tagline}
                </div>
                <div className="font-body text-iron-gray text-sm leading-relaxed">
                  {g.desc}
                </div>

                {/* Bottom accent line */}
                <div
                  className="mt-6 h-px transition-all duration-300"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--iron-red) 0%, transparent 100%)",
                    opacity: 0,
                  }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

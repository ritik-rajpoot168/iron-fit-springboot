// src/components/FeaturesSection.tsx
import { Bot, BarChart3, CalendarDays, FileDown, ShieldCheck, Smartphone } from "lucide-react";

const FEATURES = [
  {
    icon: Bot,
    title: "AI Fitness Coach",
    desc: "Personalized plans built for your exact body, goal, schedule, equipment, and training level.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    desc: "Dashboard with real metrics. Training days, plan history, and goal streaks.",
  },
  {
    icon: CalendarDays,
    title: "7-Day Schedules",
    desc: "Full week calendars with optimal training-to-recovery ratios baked in.",
  },
  {
    icon: FileDown,
    title: "PDF Export",
    desc: "Download your branded plan PDF. Bring it to the gym, no signal required.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    desc: "NextAuth sessions + MongoDB. Your plans belong to you, always.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    desc: "Built for the gym floor. Full responsive design, every screen size.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-6 border-t border-iron">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <div className="section-tag">Platform Features</div>
            <h2 className="hero-title text-[clamp(2rem,5vw,3.5rem)]">BUILT DIFFERENT</h2>
          </div>
        </div>

        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            background: "var(--iron-border)",
          }}
        >
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="iron-card p-8 group transition-colors duration-200 hover:bg-iron-card2"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-8 h-8 flex items-center justify-center"
                    style={{
                      border: "1px solid var(--iron-border2)",
                      background: "var(--iron-red-glow2)",
                    }}
                  >
                    <Icon size={15} className="text-iron-red" />
                  </div>
                  <div className="font-display font-black text-base uppercase tracking-wide group-hover:text-iron-red transition-colors">
                    {f.title}
                  </div>
                </div>
                <div className="font-body text-iron-gray text-sm leading-relaxed">
                  {f.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

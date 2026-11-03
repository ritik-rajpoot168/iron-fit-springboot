// src/components/GenerateClient.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { UserProfile, WorkoutPlan } from "@/types";
import { ProfileForm } from "./ProfileForm";
import { PlanView } from "./PlanView";
import { useToast } from "@/components/ui/use-toast";
import { Flame, Brain, Calendar, Dumbbell, CheckCircle } from "lucide-react";

interface Props { userId: string }

const LOADING_STEPS = [
  { icon: Brain,       label: "Analyzing your profile",    delay: 0    },
  { icon: Calendar,    label: "Building weekly schedule",  delay: 1800 },
  { icon: Dumbbell,    label: "Selecting exercises",       delay: 3600 },
  { icon: CheckCircle, label: "Finalizing your plan",      delay: 5400 },
];

function GeneratingScreen({ message }: { message: string }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = LOADING_STEPS.slice(1).map((s, i) =>
      setTimeout(() => setActiveStep(i + 1), s.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Animated icon */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div
              className="w-20 h-20 flex items-center justify-center border border-iron-red"
              style={{ background: "var(--iron-red-glow)" }}
            >
              <Flame size={36} className="text-iron-red animate-pulse" />
            </div>
            <div
              className="absolute inset-0 border border-iron-red/30 animate-ping"
              style={{ animationDuration: "2s" }}
            />
          </div>
        </div>

        <h2 className="hero-title text-3xl text-center mb-2">AI COACH AT WORK</h2>
        <p className="text-center text-iron-gray font-body text-sm mb-10">{message}</p>

        {/* Step list */}
        <div className="space-y-3">
          {LOADING_STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border transition-all duration-500"
                style={{
                  background: active ? "var(--iron-red-glow)" : done ? "var(--iron-card)" : "transparent",
                  borderColor: active ? "var(--iron-red)" : done ? "var(--iron-border2)" : "var(--iron-border)",
                  opacity: i > activeStep ? 0.35 : 1,
                }}
              >
                <Icon
                  size={15}
                  style={{ color: active ? "var(--iron-red)" : done ? "#4caf50" : "var(--iron-gray)", flexShrink: 0 }}
                />
                <span
                  className="font-display text-2xs tracking-widest uppercase"
                  style={{ color: active ? "var(--iron-white)" : done ? "var(--iron-gray-light)" : "var(--iron-gray)" }}
                >
                  {step.label}
                </span>
                {done && (
                  <CheckCircle size={12} style={{ color: "#4caf50", marginLeft: "auto" }} />
                )}
                {active && (
                  <div className="ml-auto flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <div
                        key={d}
                        className="w-1 h-1 rounded-full bg-iron-red"
                        style={{ animation: `pulseDot 1.2s ease-in-out ${d * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function GenerateClient({ userId }: Props) {
  const [phase, setPhase] = useState<"form" | "loading" | "plan">("form");
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Analyzing your profile...");
  const { toast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const MSGS = [
    "Analyzing your profile...",
    "Building your schedule...",
    "Selecting exercises...",
    "Finalizing your plan...",
  ];

  const handleGenerate = async (p: UserProfile) => {
    setProfile(p);
    setPhase("loading");
    setSaved(false);
    setLoadingMsg(MSGS[0]);

    let i = 0;
    intervalRef.current = setInterval(() => {
      i = (i + 1) % MSGS.length;
      setLoadingMsg(MSGS[i]);
    }, 1800);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setPlan(data.plan);
      setPhase("plan");
      toast({ title: "Plan generated!", description: "Your AI workout plan is ready.", variant: "success" });
    } catch (err) {
      toast({ title: "Generation failed", description: String(err), variant: "destructive" });
      setPhase("form");
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const handleSave = async () => {
    if (!plan || !profile) return;
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, profile, userId }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      toast({ title: "Plan saved!", description: "View it in your Dashboard.", variant: "success" });
    } catch (err) {
      toast({ title: "Save failed", description: String(err), variant: "destructive" });
    }
  };

  if (phase === "loading") return <GeneratingScreen message={loadingMsg} />;

  if (phase === "plan" && plan && profile) {
    return (
      <PlanView
        plan={plan}
        profile={profile}
        onSave={handleSave}
        onBack={() => setPhase("form")}
        saved={saved}
      />
    );
  }

  return <ProfileForm onGenerate={handleGenerate} />;
}

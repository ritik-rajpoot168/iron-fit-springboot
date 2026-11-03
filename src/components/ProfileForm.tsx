// src/components/ProfileForm.tsx
"use client";
import { useState } from "react";
import { UserProfile } from "@/types";
import { Flame, Dumbbell, Repeat, Target, Zap, Heart, Activity, Waves, ArrowRight, Check } from "lucide-react";

const GOALS = [
  {
    id: "Fat Loss",
    label: "Fat Loss",
    Icon: Flame,
    tagline: "Burn fat. Stay lean.",
    desc: "Caloric deficit + strength to maximize fat loss.",
  },
  {
    id: "Muscle Gain",
    label: "Muscle Gain",
    Icon: Dumbbell,
    tagline: "Lift heavy. Grow strong.",
    desc: "Progressive overload for maximum hypertrophy.",
  },
  {
    id: "Recomposition",
    label: "Body Recomp",
    Icon: Repeat,
    tagline: "Burn fat. Build muscle.",
    desc: "Simultaneous fat loss and muscle gain.",
  },
  {
    id: "General Fitness",
    label: "General Fitness",
    Icon: Target,
    tagline: "Move better. Feel stronger.",
    desc: "Balanced health and performance programming.",
  },
];

const WORKOUT_TYPES = [
  { id: "Strength", label: "Strength", Icon: Dumbbell, desc: "Lift heavy. Move purposefully." },
  { id: "HIIT", label: "HIIT", Icon: Zap, desc: "Short bursts. Maximum output." },
  { id: "Cardio", label: "Cardio", Icon: Heart, desc: "Build your engine." },
  { id: "Mobility", label: "Mobility", Icon: Activity, desc: "Move well. Hurt less." },
  { id: "Yoga", label: "Yoga", Icon: Waves, desc: "Flow. Recover." },
];

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];
const EQUIPMENT = ["Full Gym", "Home Gym", "Dumbbells", "Resistance Bands", "No Equipment"];
const ACTIVITY_LEVELS = ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"];
const SLEEP_QUALITY = ["Poor", "Average", "Good", "Excellent"];
const FOCUS_AREAS = ["Chest", "Back", "Arms", "Legs", "Core", "Full Body", "Mobility"];

interface Props {
  onGenerate: (profile: UserProfile) => void;
}

export function ProfileForm({ onGenerate }: Props) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    goal: "",
    age: "",
    weight: "",
    height: "",
    gender: "Male",
    level: "Intermediate",
    workoutType: "",
    equipment: "Full Gym",
    workoutDaysPerWeek: "4",
    sessionDuration: "45",
    activityLevel: "Moderately Active",
    sleepQuality: "Good",
    focusAreas: ["Full Body"],
  });

  const set = (key: keyof UserProfile, value: string) =>
    setProfile((p) => ({ ...p, [key]: value }));
  const toggleFocus = (value: string) =>
    setProfile((p) => {
      const current = p.focusAreas ?? [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current.filter((item) => item !== "Full Body"), value].slice(0, 4);
      return { ...p, focusAreas: value === "Full Body" ? ["Full Body"] : next.length ? next : ["Full Body"] };
    });

  const steps = [
    {
      title: "WHAT'S YOUR GOAL?",
      subtitle: "Your goal shapes your entire program.",
      valid: () => !!profile.goal,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GOALS.map((g) => {
            const isActive = profile.goal === g.id;
            return (
              <button
                key={g.id}
                onClick={() => set("goal", g.id)}
                className="p-6 text-left transition-all duration-200 border-2 relative overflow-hidden group"
                style={{
                  background: isActive ? "var(--iron-red-glow)" : "var(--iron-card)",
                  borderColor: isActive ? "var(--iron-red)" : "var(--iron-border2)",
                }}
              >
                {isActive && (
                  <div className="absolute top-3 right-3">
                    <Check size={14} className="text-iron-red" />
                  </div>
                )}
                <g.Icon
                  size={22}
                  className="mb-4 transition-colors"
                  style={{ color: isActive ? "var(--iron-red)" : "var(--iron-gray)" }}
                />
                <div className="font-display font-black text-lg uppercase tracking-wide mb-1 text-iron-white">
                  {g.label}
                </div>
                <div className="font-display text-2xs tracking-widest uppercase text-iron-red mb-2">
                  {g.tagline}
                </div>
                <div className="font-body text-iron-gray text-xs leading-relaxed">
                  {g.desc}
                </div>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: "YOUR STATS",
      subtitle: "Accurate data = a better plan.",
      valid: () => !!profile.age && !!profile.weight && !!profile.height,
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
                Age
              </label>
              <input
                className="iron-input"
                type="number"
                placeholder="25"
                min="16"
                max="80"
                value={profile.age}
                onChange={(e) => set("age", e.target.value)}
              />
            </div>
            <div>
              <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
                Weight (kg)
              </label>
              <input
                className="iron-input"
                type="number"
                placeholder="75"
                min="40"
                max="160"
                value={profile.weight}
                onChange={(e) => set("weight", e.target.value)}
              />
            </div>
            <div>
              <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
                Height (cm)
              </label>
              <input
                className="iron-input"
                type="number"
                placeholder="178"
                min="140"
                max="210"
                value={profile.height}
                onChange={(e) => set("height", e.target.value)}
              />
            </div>
            <div>
              <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
                Gender
              </label>
              <select
                className="iron-input"
                value={profile.gender}
                onChange={(e) => set("gender", e.target.value)}
              >
                {["Male", "Female", "Other"].map((g) => (
                  <option key={g} value={g} style={{ background: "#111" }}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
              Equipment Access
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {EQUIPMENT.map((eq) => (
                <button
                  key={eq}
                  onClick={() => set("equipment", eq)}
                  className="py-3 font-display font-bold text-2xs tracking-widest uppercase transition-all border"
                  style={{
                    background: profile.equipment === eq ? "var(--iron-red)" : "transparent",
                    borderColor:
                      profile.equipment === eq ? "var(--iron-red)" : "var(--iron-border2)",
                    color: "var(--iron-white)",
                  }}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
              Workout Days Per Week
            </label>
            <div className="grid grid-cols-5 gap-2">
              {["2", "3", "4", "5", "6"].map((days) => (
                <button
                  key={days}
                  onClick={() => set("workoutDaysPerWeek", days)}
                  className="py-3 font-display font-bold text-2xs tracking-widest uppercase transition-all border"
                  style={{
                    background: profile.workoutDaysPerWeek === days ? "var(--iron-red)" : "transparent",
                    borderColor:
                      profile.workoutDaysPerWeek === days ? "var(--iron-red)" : "var(--iron-border2)",
                    color: "var(--iron-white)",
                  }}
                >
                  {days}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
              Session Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["30", "45", "60", "75"].map((duration) => (
                <button
                  key={duration}
                  onClick={() => set("sessionDuration", duration)}
                  className="py-3 font-display font-bold text-2xs tracking-widest uppercase transition-all border"
                  style={{
                    background: profile.sessionDuration === duration ? "var(--iron-red)" : "transparent",
                    borderColor: profile.sessionDuration === duration ? "var(--iron-red)" : "var(--iron-border2)",
                    color: "var(--iron-white)",
                  }}
                >
                  {duration}m
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "LIFESTYLE CHECK",
      subtitle: "Recovery and daily activity tune your training load.",
      valid: () => !!profile.activityLevel && !!profile.sleepQuality,
      content: (
        <div className="space-y-5">
          <div>
            <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
              Activity Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => set("activityLevel", level)}
                  className="py-3 px-2 font-display font-bold text-2xs tracking-widest uppercase transition-all border"
                  style={{
                    background: profile.activityLevel === level ? "var(--iron-red)" : "transparent",
                    borderColor: profile.activityLevel === level ? "var(--iron-red)" : "var(--iron-border2)",
                    color: "var(--iron-white)",
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
              Sleep Quality
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SLEEP_QUALITY.map((quality) => (
                <button
                  key={quality}
                  onClick={() => set("sleepQuality", quality)}
                  className="py-3 font-display font-bold text-2xs tracking-widest uppercase transition-all border"
                  style={{
                    background: profile.sleepQuality === quality ? "var(--iron-red)" : "transparent",
                    borderColor: profile.sleepQuality === quality ? "var(--iron-red)" : "var(--iron-border2)",
                    color: "var(--iron-white)",
                  }}
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "CHOOSE YOUR WEAPON",
      subtitle: "Pick your primary training style.",
      valid: () => !!profile.workoutType && !!profile.focusAreas?.length,
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WORKOUT_TYPES.map((w) => {
              const isActive = profile.workoutType === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => set("workoutType", w.id)}
                  className="p-5 text-left transition-all duration-200 border-2 flex items-start gap-4"
                  style={{
                    background: isActive ? "var(--iron-red-glow)" : "var(--iron-card)",
                    borderColor: isActive ? "var(--iron-red)" : "var(--iron-border2)",
                  }}
                >
                  <w.Icon
                    size={18}
                    style={{ color: isActive ? "var(--iron-red)" : "var(--iron-gray)", marginTop: "2px", flexShrink: 0 }}
                  />
                  <div>
                    <div className="font-display font-black text-base uppercase tracking-wide mb-1 text-iron-white">
                      {w.label}
                    </div>
                    <div className="font-body text-iron-gray text-xs">{w.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-3">
              Fitness Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => set("level", l)}
                  className="py-3 font-display font-bold text-2xs tracking-widest uppercase transition-all border"
                  style={{
                    background: profile.level === l ? "var(--iron-red)" : "transparent",
                    borderColor: profile.level === l ? "var(--iron-red)" : "var(--iron-border2)",
                    color: "var(--iron-white)",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-3">
              Focus Areas
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FOCUS_AREAS.map((area) => {
                const active = profile.focusAreas?.includes(area);
                return (
                  <button
                    key={area}
                    onClick={() => toggleFocus(area)}
                    className="py-3 font-display font-bold text-2xs tracking-widest uppercase transition-all border"
                    style={{
                      background: active ? "var(--iron-red)" : "transparent",
                      borderColor: active ? "var(--iron-red)" : "var(--iron-border2)",
                      color: "var(--iron-white)",
                    }}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const pct = Math.round(((step + 1) / steps.length) * 100);

  return (
    <div className="max-w-[680px] mx-auto px-4 py-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="section-tag mb-0">
            Step {step + 1} / {steps.length}
          </span>
          <span className="font-display text-2xs tracking-widest text-iron-gray">{pct}%</span>
        </div>
        <div className="h-px bg-iron-border2 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-iron-red transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Step header */}
      <div className="mb-8">
        <h2 className="hero-title text-[clamp(1.8rem,5vw,2.8rem)] mb-2">{current.title}</h2>
        <p className="font-body text-iron-gray text-sm">{current.subtitle}</p>
      </div>

      {/* Content */}
      <div className="animate-fade-in">{current.content}</div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button className="btn-outline flex-1" onClick={() => setStep((s) => s - 1)}>
            ← Back
          </button>
        )}
        <button
          className="btn-primary flex-[2] justify-center py-4 text-sm"
          onClick={() => {
            if (!current.valid()) return;
            if (isLast) onGenerate(profile);
            else setStep((s) => s + 1);
          }}
          disabled={!current.valid()}
        >
          {isLast ? (
            <>
              Generate My Plan
              <Flame size={15} />
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

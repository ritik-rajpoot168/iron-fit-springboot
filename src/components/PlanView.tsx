// src/components/PlanView.tsx
"use client";
import { useState } from "react";
import { WorkoutPlan, UserProfile } from "@/types";
import { exportPlanAsPDF } from "@/lib/pdf";
import {
  ArrowLeft, Download, Save, CheckCircle,
  Moon, ChevronRight, Target, Utensils, CalendarDays
} from "lucide-react";

interface Props {
  plan: WorkoutPlan;
  profile: UserProfile;
  onSave?: () => void;
  onBack?: () => void;
  saved?: boolean;
}

export function PlanView({ plan, profile, onSave, onBack, saved }: Props) {
  const [activeDay, setActiveDay] = useState(0);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try { await exportPlanAsPDF(plan, profile); }
    finally { setExporting(false); }
  };

  const day = plan.weeklySchedule[activeDay];
  const trainingDays = plan.weeklySchedule.filter((d) => !d.isRest).length;
  const restDays = plan.weeklySchedule.filter((d) => d.isRest).length;

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <div className="section-tag">Your AI-Generated Plan</div>
          <h1 className="hero-title text-[clamp(1.8rem,5vw,3rem)] mb-2">
            {plan.planName}
          </h1>
          <p className="font-body text-iron-gray-light text-sm leading-relaxed max-w-xl">
            {plan.overview}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {onBack && (
            <button className="btn-ghost flex items-center gap-2" onClick={onBack}>
              <ArrowLeft size={14} /> Back
            </button>
          )}
          {onSave && !saved && (
            <button className="btn-outline px-5 py-2 text-xs" onClick={onSave}>
              <Save size={13} /> Save Plan
            </button>
          )}
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2 border border-green-600/40 bg-green-600/10">
              <CheckCircle size={13} style={{ color: "#4caf50" }} />
              <span className="font-display text-2xs tracking-widest uppercase" style={{ color: "#4caf50" }}>
                Saved
              </span>
            </div>
          )}
          <button
            className="btn-primary px-5 py-2 text-xs"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download size={13} />
            {exporting ? "Exporting…" : "Export PDF"}
          </button>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px mb-8" style={{ background: "var(--iron-border)" }}>
        {[
          { Icon: Target,       label: "Weekly Goal",  value: plan.weeklyGoal },
          { Icon: Utensils,     label: "Nutrition",    value: plan.nutritionTip },
          { Icon: CalendarDays, label: "Schedule",
            value: `${trainingDays} training · ${restDays} rest` },
        ].map((s) => (
          <div key={s.label} className="iron-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <s.Icon size={13} className="text-iron-red" />
              <span className="font-display text-2xs font-bold tracking-widest uppercase text-iron-gray">
                {s.label}
              </span>
            </div>
            <div className="font-body text-sm text-iron-white leading-relaxed">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px mb-8" style={{ background: "var(--iron-border)" }}>
        {[
          { label: "Warmup", value: plan.warmup },
          { label: "Cooldown", value: plan.cooldown },
          { label: "Training Notes", value: plan.trainingNotes },
        ].map((item) => (
          <div key={item.label} className="iron-card p-5">
            <div className="font-display text-2xs font-bold tracking-widest uppercase text-iron-red mb-2">
              {item.label}
            </div>
            <div className="font-body text-xs text-iron-gray-light leading-relaxed">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px mb-8" style={{ background: "var(--iron-border)" }}>
        {[
          { label: "Goal Summary", value: plan.goalSummary ?? plan.overview },
          { label: "Calories", value: plan.estimatedCaloriesBurned ?? "Personalized estimate included in training notes." },
          { label: "Training Target", value: plan.weeklyTrainingTarget ?? plan.weeklyGoal },
          { label: "Daily Calories", value: plan.dailyCalories ?? "Calculated from profile targets." },
          { label: "Protein", value: plan.proteinTarget ?? "Protein target based on body weight." },
          { label: "Hydration", value: plan.hydrationGoal ?? "Hydrate before and after sessions." },
        ].map((item) => (
          <div key={item.label} className="iron-card p-5">
            <div className="font-display text-2xs font-bold tracking-widest uppercase text-iron-red mb-2">
              {item.label}
            </div>
            <div className="font-body text-xs text-iron-gray-light leading-relaxed">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px mb-8" style={{ background: "var(--iron-border)" }}>
        {[
          { label: "Week 1-2", value: plan.progression?.week1to2 ?? "Build consistency and learn technique." },
          { label: "Week 3-4", value: plan.progression?.week3to4 ?? "Add reps, duration, or load gradually." },
          { label: "Week 5-8", value: plan.progression?.week5to8 ?? "Progress intensity while monitoring recovery." },
        ].map((item) => (
          <div key={item.label} className="iron-card p-5">
            <div className="font-display text-2xs font-bold tracking-widest uppercase text-iron-red mb-2">
              {item.label}
            </div>
            <div className="font-body text-xs text-iron-gray-light leading-relaxed">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="iron-card p-5 mb-8">
        <div className="font-display text-2xs font-bold tracking-widest uppercase text-iron-red mb-2">
          Safety Notes
        </div>
        <p className="font-body text-xs text-iron-gray-light leading-relaxed">
          {plan.safety?.formTips ?? "Warm up before every workout, use proper form, respect rest and recovery, and stop any movement that causes pain."}
          {" "}
          {plan.safety?.recoveryNotes ?? "If you have medical issues, injuries, or unusual symptoms, consult a qualified professional before training."}
        </p>
      </div>

      {/* ── Profile badge strip ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          profile.goal, profile.level, profile.workoutType, profile.equipment,
          `${profile.age}y`, `${profile.weight}kg`, `${profile.height}cm`,
          `${profile.workoutDaysPerWeek ?? "4"} days/week`,
          `${profile.sessionDuration ?? "45"} min`,
          ...(profile.focusAreas ?? ["Full Body"]),
        ].map((tag) => (
          <span key={tag} className="badge">{tag}</span>
        ))}
      </div>

      {/* ── Day tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {plan.weeklySchedule.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className="shrink-0 px-4 py-2 font-display font-bold text-2xs tracking-widest uppercase transition-all border"
            style={{
              background: activeDay === i ? "var(--iron-red)" : "transparent",
              borderColor: activeDay === i ? "var(--iron-red)" : "var(--iron-border2)",
              color: activeDay === i ? "#fff" : "var(--iron-gray-light)",
            }}
          >
            {d.day.slice(0, 3)}
            {d.isRest ? " 💤" : ""}
          </button>
        ))}
      </div>

      {/* ── Day content ──────────────────────────────────────────────────── */}
      <div className="iron-card overflow-hidden">
        {/* Day header */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b border-iron"
          style={{ background: "var(--iron-card2)" }}
        >
          <div>
            <div className="font-display text-2xs tracking-widest uppercase text-iron-gray mb-1">
              {day.day}
            </div>
            <div className="font-display font-black text-xl uppercase tracking-wide">{day.focus}</div>
            {!day.isRest && (
              <div className="font-body text-iron-gray text-xs mt-1">
                {day.duration ?? profile.sessionDuration ?? "45 min"} · {day.intensity ?? "Moderate"} intensity
              </div>
            )}
          </div>
          {day.isRest ? (
            <div className="flex items-center gap-2 text-iron-gray">
              <Moon size={16} />
              <span className="font-display text-2xs tracking-widest uppercase">Rest Day</span>
            </div>
          ) : (
            <span className="badge badge-red">
              {day.exercises.length} exercises
            </span>
          )}
        </div>

        {/* Body */}
        {day.isRest ? (
          <div className="py-16 text-center">
            <Moon size={40} className="text-iron-gray mx-auto mb-4 opacity-40" />
            <div className="font-display font-black text-lg uppercase text-iron-gray">Recovery Day</div>
            <p className="font-body text-iron-gray text-sm mt-2">
              {day.coachNotes ?? "Rest, hydrate, and let your muscles grow."}
            </p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "var(--iron-border)" }}>
              {[
                { label: "Warmup", value: day.warmup ?? plan.warmup },
                { label: "Coach Notes", value: day.coachNotes ?? plan.trainingNotes },
                { label: "Cooldown", value: day.cooldown ?? plan.cooldown },
              ].map((item) => (
                <div key={item.label} className="p-4" style={{ background: "var(--iron-card)" }}>
                  <div className="font-display text-2xs font-bold tracking-widest uppercase text-iron-red mb-2">{item.label}</div>
                  <div className="font-body text-xs text-iron-gray-light leading-relaxed">{item.value}</div>
                </div>
              ))}
            </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--iron-border2)", background: "var(--iron-dark2)" }}>
                  {["#", "Exercise", "Sets", "Reps", "Rest", "Notes"].map((h) => (
                    <th
                      key={h}
                      className="font-display text-2xs font-bold tracking-widest uppercase text-iron-gray py-3 px-4 text-left whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {day.exercises.map((ex, i) => (
                  <tr
                    key={i}
                    className="group transition-colors"
                    style={{
                      borderBottom: "1px solid var(--iron-border)",
                      background: i % 2 !== 0 ? "rgba(255,255,255,0.015)" : "transparent",
                    }}
                  >
                    <td className="py-3.5 px-4 font-display text-iron-gray text-sm">{i + 1}</td>
                    <td className="py-3.5 px-4 font-display font-black text-iron-white">{ex.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-display font-black text-iron-red text-base">{ex.sets}</span>
                    </td>
                    <td className="py-3.5 px-4 font-body text-iron-gray-light">{ex.reps}</td>
                    <td className="py-3.5 px-4 font-body text-iron-gray-light whitespace-nowrap">{ex.rest}</td>
                    <td className="py-3.5 px-4 font-body text-iron-gray text-xs max-w-[200px] truncate">
                      {ex.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </div>

      {/* ── Day navigator ────────────────────────────────────────────────── */}
      <div className="flex justify-between mt-4">
        <button
          className="btn-ghost flex items-center gap-2 text-xs"
          onClick={() => setActiveDay((d) => Math.max(0, d - 1))}
          disabled={activeDay === 0}
        >
          <ArrowLeft size={13} /> Previous
        </button>
        <button
          className="btn-ghost flex items-center gap-2 text-xs"
          onClick={() => setActiveDay((d) => Math.min(plan.weeklySchedule.length - 1, d + 1))}
          disabled={activeDay === plan.weeklySchedule.length - 1}
        >
          Next <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

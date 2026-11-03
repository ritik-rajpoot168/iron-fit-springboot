// src/components/DashboardClient.tsx
"use client";
import { useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { ProgressRecord, SavedPlan } from "@/types";
import { PlanView } from "./PlanView";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus, Eye, Pencil, Trash2, Check, X,
  Flame, BarChart3, CalendarDays, Target, TrendingUp,
  Clock, Dumbbell, Search, Filter, Weight
} from "lucide-react";

interface Props {
  initialPlans: SavedPlan[];
  userName: string;
  initialProgress: ProgressRecord[];
  currentGoal: string;
  currentBmi: number;
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: ElementType; label: string; value: string | number; sub?: string;
}) {
  const valueText = String(value);
  return (
    <div className="iron-card p-6 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 flex items-center justify-center"
          style={{ background: "var(--iron-red-glow2)", border: "1px solid var(--iron-border2)" }}
        >
          <Icon size={13} className="text-iron-red" />
        </div>
        <span className="font-display text-2xs tracking-widest uppercase text-iron-gray">{label}</span>
      </div>
      <div className={`font-display font-black tracking-tight text-iron-red leading-none ${valueText.length > 8 ? "text-xl" : "text-4xl"}`}>
        {value}
      </div>
      {sub && <div className="font-body text-iron-gray text-xs">{sub}</div>}
    </div>
  );
}

function PlanCard({
  plan,
  onView,
  onEdit,
  onDelete,
}: {
  plan: SavedPlan;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="iron-card p-5 flex flex-wrap items-center justify-between gap-4 group transition-colors hover:border-iron-border2">
      {/* Left: info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Flame size={12} className="text-iron-red shrink-0" />
          <div className="font-display font-black text-base uppercase tracking-wide text-iron-white truncate">
            {plan.name}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="badge">{plan.goal}</span>
          <span className="badge">{plan.level}</span>
          <span className="badge">{plan.workoutType}</span>
          <span className="font-display text-2xs text-iron-gray tracking-widest ml-1 hidden sm:inline">
            {plan.createdAt}
          </span>
        </div>
      </div>

      {/* Right: actions */}
      {confirmDelete ? (
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-display text-2xs tracking-widest uppercase text-iron-gray">Delete?</span>
          <button
            className="btn-primary px-3 py-2 text-2xs"
            onClick={onDelete}
          >
            <Check size={12} /> Yes
          </button>
          <button
            className="btn-outline px-3 py-2 text-2xs"
            onClick={() => setConfirmDelete(false)}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2 shrink-0">
          <button className="btn-outline px-4 py-2 text-2xs gap-1.5" onClick={onView}>
            <Eye size={12} /> View
          </button>
          <Link className="btn-outline px-4 py-2 text-2xs gap-1.5" href={`/plans/${plan.id}`}>
            Details
          </Link>
          <button className="btn-ghost px-3 py-2 text-2xs gap-1.5" onClick={onEdit}>
            <Pencil size={12} /> Edit
          </button>
          <button
            className="btn-ghost px-3 py-2 text-2xs gap-1.5 text-iron-red hover:text-red-400"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function DashboardClient({ initialPlans, userName, initialProgress, currentGoal, currentBmi }: Props) {
  const [plans, setPlans] = useState<SavedPlan[]>(initialPlans);
  const [viewing, setViewing] = useState<SavedPlan | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [query, setQuery] = useState("");
  const [goalFilter, setGoalFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/plans/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setPlans((p) => p.filter((plan) => plan.id !== id));
      toast({ title: "Plan deleted.", variant: "default" });
    } catch {
      toast({ title: "Error", description: "Failed to delete plan.", variant: "destructive" });
    }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`/api/plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (!res.ok) throw new Error("Update failed");
      setPlans((p) => p.map((plan) => (plan.id === id ? { ...plan, name: editName.trim() } : plan)));
      setEditingId(null);
      toast({ title: "Plan renamed.", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Failed to rename plan.", variant: "destructive" });
    }
  };

  // Viewing a plan
  if (viewing) {
    return (
      <div className="py-8">
        <PlanView
          plan={viewing.planData}
          profile={viewing.profileData}
          onBack={() => setViewing(null)}
          saved
        />
      </div>
    );
  }

  // Stats
  const totalTrainingDays = plans.reduce(
    (acc, p) => acc + (p.planData?.weeklySchedule?.filter((d) => !d.isRest).length ?? 0),
    0
  );
  const completedDays = plans.reduce((acc, p) => acc + (p.progress?.completedDays?.length ?? 0), 0);
  const trackedWorkouts = initialProgress.reduce((sum, record) => sum + record.completedWorkouts, 0);
  const uniqueGoals = [...new Set(plans.map((p) => p.goal))].length;
  const latestProgress = initialProgress[0];
  const oldestProgress = initialProgress[initialProgress.length - 1];
  const weightChange = latestProgress && oldestProgress
    ? Number(latestProgress.weight) - Number(oldestProgress.weight)
    : 0;
  const weeklyActivity = initialProgress.slice(0, 7).reduce((sum, record) => sum + record.completedWorkouts, 0);
  const goals = ["All", ...Array.from(new Set(plans.map((p) => p.goal)))];
  const levels = ["All", ...Array.from(new Set(plans.map((p) => p.level)))];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPlans = plans.filter((plan) => {
    const matchesQuery = !normalizedQuery ||
      [plan.name, plan.goal, plan.level, plan.workoutType, plan.equipment]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    const matchesGoal = goalFilter === "All" || plan.goal === goalFilter;
    const matchesLevel = levelFilter === "All" || plan.level === levelFilter;
    return matchesQuery && matchesGoal && matchesLevel;
  });

  return (
    <div className="max-w-[900px] mx-auto px-4 py-10">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
        <div>
          <div className="section-tag">Your Progress</div>
          <h1 className="hero-title text-[clamp(2rem,5vw,3rem)]">
            WELCOME BACK,{" "}
            <span className="text-iron-red">
              {userName.split(" ")[0].toUpperCase()}
            </span>
          </h1>
        </div>
        <Link href="/generate" className="btn-primary px-6 py-3 text-xs">
          <Plus size={14} /> New Plan
        </Link>
      </div>

      {/* ── Stats grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px mb-10" style={{ background: "var(--iron-border)" }}>
        <StatCard icon={BarChart3}    label="Total Plans"     value={plans.length}        sub="AI-generated" />
        <StatCard icon={CalendarDays} label="Training Days"   value={totalTrainingDays}   sub="across all plans" />
        <StatCard icon={Target}       label="Current Goal"    value={currentGoal}         sub={`${uniqueGoals} saved goal types`} />
        <StatCard icon={Clock}        label="Completed"       value={completedDays + trackedWorkouts} sub={`${weeklyActivity} this week`} />
        <StatCard icon={Weight}       label="BMI"             value={currentBmi || "None"}
                                                              sub={latestProgress ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}kg trend` : "No records yet"} />
      </div>

      <div className="iron-card p-6 mb-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <div className="section-tag">Dashboard Analytics</div>
            <h2 className="font-display font-black text-xl uppercase tracking-wide">Weekly Activity</h2>
          </div>
          <span className="badge">{weeklyActivity} workouts tracked</span>
        </div>
        <div className="flex items-end gap-2 h-24">
          {initialProgress.length === 0 ? (
            <p className="font-body text-iron-gray text-sm">Progress charts appear after you save body metrics.</p>
          ) : initialProgress.slice(0, 7).reverse().map((record) => (
            <div key={record.id} className="flex-1 min-w-0">
              <div
                className="bg-iron-red mx-auto"
                style={{ height: `${Math.max(12, record.completedWorkouts * 18)}px`, width: "70%" }}
              />
              <div className="font-display text-[9px] text-iron-gray text-center mt-2 truncate">{record.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Plan list ──────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display font-black text-xl uppercase tracking-wide">
          Plan History
          <span className="text-iron-red ml-2 text-base">({plans.length})</span>
        </h2>
        {plans.length > 0 && (
          <div className="flex items-center gap-2 text-iron-gray">
            <TrendingUp size={13} />
            <span className="font-display text-2xs tracking-widest uppercase">
              {plans.filter((p) => p.planData?.weeklySchedule?.some((d) => !d.isRest)).length} active programs
            </span>
          </div>
        )}
      </div>

      {plans.length > 0 && (
        <div className="iron-card p-4 mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-iron-gray" />
            <input
              className="iron-input pl-11 py-3 text-sm"
              placeholder="Search plans"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-iron-gray" />
              <select className="iron-input pl-9 py-3 text-xs" value={goalFilter} onChange={(e) => setGoalFilter(e.target.value)}>
                {goals.map((goal) => <option key={goal} value={goal} style={{ background: "#111" }}>{goal}</option>)}
              </select>
            </div>
            <select className="iron-input py-3 text-xs" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
              {levels.map((level) => <option key={level} value={level} style={{ background: "#111" }}>{level}</option>)}
            </select>
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────── */
        <div className="iron-card p-16 text-center">
          <div
            className="w-16 h-16 flex items-center justify-center mx-auto mb-6 border border-iron-border2"
            style={{ background: "var(--iron-red-glow2)" }}
          >
            <Dumbbell size={28} className="text-iron-red opacity-60" />
          </div>
          <h3 className="font-display font-black text-xl uppercase tracking-wide mb-2">
            No plans yet
          </h3>
          <p className="text-iron-gray font-body text-sm mb-8 max-w-xs mx-auto">
            Generate your first AI-powered workout plan tailored to your goals and stats.
          </p>
          <Link href="/generate" className="btn-primary px-10 py-4 text-sm justify-center">
            <Flame size={15} /> Generate My First Plan
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPlans.length === 0 && (
            <div className="iron-card p-10 text-center">
              <Search size={24} className="text-iron-gray mx-auto mb-3 opacity-60" />
              <div className="font-display font-black text-base uppercase tracking-wide mb-2">No matching plans</div>
              <p className="text-iron-gray font-body text-sm">Adjust your search or filters to reveal more programs.</p>
            </div>
          )}
          {filteredPlans.map((p) =>
            editingId === p.id ? (
              /* ── Inline edit ─────────────────────────────── */
              <div key={p.id} className="iron-card p-5 flex gap-3 items-center flex-wrap">
                <input
                  className="iron-input flex-1 min-w-[180px] py-2.5 text-sm"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEdit(p.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button className="btn-primary px-4 py-2 text-xs gap-1.5" onClick={() => handleEdit(p.id)}>
                    <Check size={12} /> Save
                  </button>
                  <button className="btn-outline px-3 py-2 text-xs gap-1.5" onClick={() => setEditingId(null)}>
                    <X size={12} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <PlanCard
                key={p.id}
                plan={p}
                onView={() => setViewing(p)}
                onEdit={() => { setEditingId(p.id); setEditName(p.name); }}
                onDelete={() => handleDelete(p.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

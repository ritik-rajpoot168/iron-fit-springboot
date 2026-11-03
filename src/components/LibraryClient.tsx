"use client";
import { useState } from "react";
import Link from "next/link";
import type { SavedPlan } from "@/types";
import { ArrowRight, BarChart2, Clock, Dumbbell, Search } from "lucide-react";

const LEVEL_COLOR: Record<string, string> = {
  Beginner: "#4caf50",
  Intermediate: "#ff9800",
  Advanced: "#e53935",
  Elite: "#9c27b0",
};

export function LibraryClient({ plans, signedIn }: { plans: SavedPlan[]; signedIn: boolean }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const types = ["All", ...Array.from(new Set(plans.map((plan) => plan.workoutType)))];
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = plans.filter((plan) => {
    const matchesType = filter === "All" || plan.workoutType === filter;
    const matchesQuery = !normalizedQuery ||
      [plan.name, plan.goal, plan.level, plan.workoutType, plan.equipment]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    return matchesType && matchesQuery;
  });

  return (
    <div className="flex-1 max-w-[1100px] mx-auto w-full px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <div className="section-tag">Generated Library</div>
          <h1 className="hero-title text-[clamp(2rem,5vw,3rem)]">ALL PROGRAMS</h1>
        </div>
        <Link href={signedIn ? "/generate" : "/login"} className="btn-primary px-6 py-3 text-xs">
          Custom AI Plan <ArrowRight size={13} />
        </Link>
      </div>

      {plans.length > 0 && (
        <div className="iron-card p-4 mb-8 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-iron-gray" />
            <input
              className="iron-input pl-11 py-3 text-sm"
              placeholder="Search generated plans"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className="px-5 py-2 font-display font-bold text-2xs tracking-widest uppercase transition-all border"
                style={{
                  background: filter === type ? "var(--iron-red)" : "transparent",
                  borderColor: filter === type ? "var(--iron-red)" : "var(--iron-border2)",
                  color: filter === type ? "#fff" : "var(--iron-gray-light)",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-8">
        <span className="font-display text-2xs tracking-widest uppercase text-iron-gray self-center">
          {filtered.length} generated programs
        </span>
      </div>

      {plans.length === 0 ? (
        <div className="iron-card p-16 text-center">
          <div
            className="w-16 h-16 flex items-center justify-center mx-auto mb-6 border border-iron-border2"
            style={{ background: "var(--iron-red-glow2)" }}
          >
            <Dumbbell size={28} className="text-iron-red opacity-60" />
          </div>
          <h3 className="font-display font-black text-xl uppercase tracking-wide mb-2">
            No generated plans yet
          </h3>
          <p className="text-iron-gray font-body text-sm mb-8 max-w-xs mx-auto">
            Generate and save a personalized plan to build your private workout library.
          </p>
          <Link href={signedIn ? "/generate" : "/login"} className="btn-primary px-10 py-4 text-sm justify-center">
            Start Library <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "var(--iron-border)" }}>
          {filtered.map((plan) => {
            const duration = plan.profileData.sessionDuration ?? "45";
            const workouts = plan.planData.weeklySchedule.filter((day) => !day.isRest).length;
            return (
              <div key={plan.id} className="iron-card p-7 flex flex-col group transition-colors hover:bg-iron-card2">
                <div className="flex items-center justify-between mb-5">
                  <span className="badge badge-red">{plan.goal}</span>
                  <span
                    className="font-display text-2xs tracking-widest uppercase"
                    style={{ color: LEVEL_COLOR[plan.level] ?? "var(--iron-gray)" }}
                  >
                    {plan.level}
                  </span>
                </div>

                <div className="font-display font-black text-xl uppercase tracking-wide text-iron-white mb-2 group-hover:text-iron-red transition-colors">
                  {plan.name}
                </div>

                <p className="font-body text-iron-gray text-sm leading-relaxed mb-6 flex-1">
                  {plan.planData.goalSummary ?? plan.planData.overview}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="badge">{plan.workoutType}</span>
                  <span className="badge">{plan.equipment}</span>
                  <span className="badge">{plan.profileData.workoutDaysPerWeek ?? workouts} days</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-iron">
                  <div className="flex items-center gap-3 text-iron-gray">
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} />
                      <span className="font-display text-2xs tracking-widest uppercase">{duration}m</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BarChart2 size={11} />
                      <span className="font-display text-2xs tracking-widest uppercase">{plan.createdAt}</span>
                    </div>
                  </div>
                  <Link href={`/plans/${plan.id}`} className="btn-primary px-4 py-2 text-2xs">
                    Open <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

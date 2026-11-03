// src/hooks/usePlans.ts
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SavedPlan, WorkoutPlan, UserProfile } from "@/types";

// ── Fetch all plans ──────────────────────────────────────────────────────────
async function fetchPlans(): Promise<SavedPlan[]> {
  const res = await fetch("/api/plans");
  if (!res.ok) throw new Error("Failed to fetch plans");
  const data = await res.json();
  return data.plans.map((p: {
    id: string; name: string; goal: string; level: string;
    workoutType: string; equipment: string; planData: WorkoutPlan;
    profileData: UserProfile; createdAt: string;
  }) => ({
    id: p.id,
    name: p.name,
    goal: p.goal,
    level: p.level,
    workoutType: p.workoutType,
    equipment: p.equipment,
    planData: p.planData,
    profileData: p.profileData,
    createdAt: new Date(p.createdAt).toLocaleDateString(),
  }));
}

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
    staleTime: 30_000,
  });
}

// ── Save plan ────────────────────────────────────────────────────────────────
async function savePlan(data: { plan: WorkoutPlan; profile: UserProfile }): Promise<SavedPlan> {
  const res = await fetch("/api/plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save plan");
  return res.json();
}

export function useSavePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: savePlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });
}

// ── Delete plan ──────────────────────────────────────────────────────────────
async function deletePlan(id: string): Promise<void> {
  const res = await fetch(`/api/plans/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete plan");
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });
}

// ── Rename plan ──────────────────────────────────────────────────────────────
async function renamePlan(data: { id: string; name: string }): Promise<void> {
  const res = await fetch(`/api/plans/${data.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: data.name }),
  });
  if (!res.ok) throw new Error("Failed to rename plan");
}

export function useRenamePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: renamePlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });
}

// ── Generate plan ────────────────────────────────────────────────────────────
async function generatePlan(profile: UserProfile): Promise<WorkoutPlan> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Generation failed");
  return data.plan;
}

export function useGeneratePlan() {
  return useMutation({ mutationFn: generatePlan });
}

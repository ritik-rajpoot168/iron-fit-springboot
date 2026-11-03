// src/store/planStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WorkoutPlan, UserProfile, GeneratePhase } from "@/types";

interface PlanStore {
  // Generate flow
  phase: GeneratePhase;
  currentPlan: WorkoutPlan | null;
  currentProfile: UserProfile | null;
  isSaved: boolean;
  loadingMessage: string;

  // Actions
  setPhase: (phase: GeneratePhase) => void;
  setCurrentPlan: (plan: WorkoutPlan | null) => void;
  setCurrentProfile: (profile: UserProfile | null) => void;
  setIsSaved: (saved: boolean) => void;
  setLoadingMessage: (msg: string) => void;
  resetGenerate: () => void;
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      phase: "form",
      currentPlan: null,
      currentProfile: null,
      isSaved: false,
      loadingMessage: "Analyzing your profile...",

      setPhase: (phase) => set({ phase }),
      setCurrentPlan: (plan) => set({ currentPlan: plan }),
      setCurrentProfile: (profile) => set({ currentProfile: profile }),
      setIsSaved: (saved) => set({ isSaved: saved }),
      setLoadingMessage: (msg) => set({ loadingMessage: msg }),
      resetGenerate: () =>
        set({
          phase: "form",
          currentPlan: null,
          currentProfile: null,
          isSaved: false,
          loadingMessage: "Analyzing your profile...",
        }),
    }),
    {
      name: "iron-fit-plan",
      partialize: (state) => ({
        currentPlan: state.currentPlan,
        currentProfile: state.currentProfile,
        isSaved: state.isSaved,
      }),
    }
  )
);

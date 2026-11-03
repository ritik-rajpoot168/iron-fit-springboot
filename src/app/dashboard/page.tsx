// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { DashboardClient } from "@/components/DashboardClient";
import { calculateBmi } from "@/lib/fitness";
import { backendJson } from "@/lib/backend";
import type { ProgressRecord, SavedPlan } from "@/types";

export const metadata = { title: "Dashboard — IRON.FIT" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [planData, progressData, userData] = await Promise.all([
    backendJson<{ plans: SavedPlan[] }>("/api/plans", session.user),
    backendJson<{ records: ProgressRecord[] }>("/api/progress", session.user),
    backendJson<{ user: { fitnessProfile?: Record<string, unknown> | null } }>("/api/user", session.user),
  ]);
  const plans = planData.plans;
  const rawProgress = progressData.records.slice(0, 30);
  const profile = userData.user.fitnessProfile;

  return (
    <main className="min-h-screen bg-iron-dark">
      <NavBar user={session.user} />
      <DashboardClient
        initialPlans={plans}
        userName={session.user.name ?? session.user.email ?? "Athlete"}
        currentGoal={String(profile?.goal ?? plans[0]?.goal ?? "Not set")}
        currentBmi={calculateBmi(
          String(rawProgress[0]?.weight ?? profile?.weight ?? "0"),
          String(profile?.height ?? "0")
        )}
        initialProgress={rawProgress}
      />
    </main>
  );
}

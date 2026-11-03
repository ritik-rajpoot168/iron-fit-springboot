import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";
import { ProgressClient } from "@/components/ProgressClient";
import type { FitnessProfile } from "@/types";
import { backendJson } from "@/lib/backend";
import type { ProgressRecord } from "@/types";

export const metadata = { title: "Progress - IRON.FIT" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

const defaultFitnessProfile: FitnessProfile = {
  goal: "General Fitness",
  age: "25",
  weight: "75",
  height: "175",
  gender: "Male",
  level: "Intermediate",
  workoutType: "Strength",
  equipment: "Gym",
  workoutDaysPerWeek: "4",
};

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [userData, progressData] = await Promise.all([
    backendJson<{ user: { fitnessProfile?: FitnessProfile | null } }>("/api/user", session.user),
    backendJson<{ records: ProgressRecord[] }>("/api/progress", session.user),
  ]);

  return (
    <main className="min-h-screen bg-iron-dark">
      <NavBar user={session.user} />
      <ProgressClient
        initialRecords={progressData.records}
        fitnessProfile={userData.user.fitnessProfile ?? defaultFitnessProfile}
      />
    </main>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";
import { SettingsClient } from "@/components/SettingsClient";
import { backendJson } from "@/lib/backend";
import type { FitnessProfile } from "@/types";

export const metadata = { title: "Settings - IRON.FIT" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { user } = await backendJson<{ user: { fitnessProfile?: FitnessProfile | null } }>("/api/user", session.user);

  return (
    <main className="min-h-screen bg-iron-dark">
      <NavBar user={session.user} />
      <SettingsClient
        name={session.user.name ?? ""}
        email={session.user.email ?? ""}
        initialFitnessProfile={user.fitnessProfile ?? null}
      />
    </main>
  );
}

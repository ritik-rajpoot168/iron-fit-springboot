import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { backendJson } from "@/lib/backend";
import { NavBar } from "@/components/NavBar";
import { PlanDetailsClient } from "@/components/PlanDetailsClient";
import type { SavedPlan } from "@/types";

export const metadata = { title: "Plan Details - IRON.FIT" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export default async function PlanDetailsPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  let plan: SavedPlan;
  try {
    ({ plan } = await backendJson<{ plan: SavedPlan }>(`/api/plans/${encodeURIComponent(id)}`, session.user));
  } catch { notFound(); }

  return (
    <main className="min-h-screen bg-iron-dark">
      <NavBar user={session.user} />
      <PlanDetailsClient initialPlan={plan!} />
    </main>
  );
}

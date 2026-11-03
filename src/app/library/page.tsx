import { auth } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { LibraryClient } from "@/components/LibraryClient";
import { backendJson } from "@/lib/backend";
import type { SavedPlan } from "@/types";

export const metadata = { title: "Library - IRON.FIT" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LibraryPage() {
  const session = await auth();
  let plans: SavedPlan[] = [];

  if (session?.user?.id) {
    const data = await backendJson<{ plans: SavedPlan[] }>("/api/plans", session.user);
    plans = data.plans;
  }

  return (
    <main className="min-h-screen bg-iron-dark flex flex-col">
      <NavBar user={session?.user ?? null} />
      <LibraryClient plans={plans} signedIn={Boolean(session?.user?.id)} />
      <Footer />
    </main>
  );
}

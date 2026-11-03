// src/app/generate/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { GenerateClient } from "@/components/GenerateClient";

export const metadata = {
  title: "AI Coach — IRON.FIT",
  description: "Generate your personalised AI workout plan",
};
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GeneratePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/generate");

  return (
    <main className="min-h-screen bg-iron-dark">
      <NavBar user={session.user} />
      <div className="py-8">
        <GenerateClient userId={session.user.id} />
      </div>
    </main>
  );
}

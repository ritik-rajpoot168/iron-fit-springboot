// src/app/login/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Login — IRON.FIT" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");
  return (
    <main className="min-h-screen bg-iron-dark">
      <AuthForm mode="login" />
    </main>
  );
}

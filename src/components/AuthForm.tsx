// src/components/AuthForm.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handle = async () => {
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      toast({
        title: mode === "login" ? "Welcome back!" : "Account created!",
        description: "Redirecting to your dashboard...",
        variant: "success",
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <Flame size={20} className="text-iron-red" />
          <span className="font-display font-black text-lg tracking-widest uppercase">
            IRON<span className="text-iron-red">.FIT</span>
          </span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="section-tag">
            {mode === "login" ? "Welcome back" : "Get started free"}
          </div>
          <h1 className="hero-title text-[2.8rem]">
            {mode === "login" ? "LOGIN" : "SIGN UP"}
          </h1>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
                Full Name
              </label>
              <input
                className="iron-input"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
              Email
            </label>
            <input
              className="iron-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>

          <div>
            <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
              Password
            </label>
            <div className="relative">
              <input
                className="iron-input pr-12"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handle()}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-iron-gray hover:text-iron-gray-light transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-3 border border-iron-red/30 bg-iron-red/5 text-iron-red text-sm font-body">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          className="btn-primary w-full justify-center py-4 mt-6 text-sm"
          onClick={handle}
          disabled={loading}
        >
          {loading ? (
            "Loading..."
          ) : (
            <>
              {mode === "login" ? "Login" : "Create Account"}
              <ArrowRight size={15} />
            </>
          )}
        </button>

        {/* Switch */}
        <p className="text-center text-iron-gray text-sm font-body mt-6">
          {mode === "login" ? "No account? " : "Already a member? "}
          <Link
            href={mode === "login" ? "/signup" : "/login"}
            className="text-iron-red hover:text-iron-white transition-colors font-semibold"
          >
            {mode === "login" ? "Sign up free" : "Login here"}
          </Link>
        </p>
      </div>
    </div>
  );
}

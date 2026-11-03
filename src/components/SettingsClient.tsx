"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { calculateTargets } from "@/lib/fitness";
import type { FitnessProfile } from "@/types";
import { Activity, Calculator, Save, ShieldCheck, Target } from "lucide-react";

const defaultFitnessProfile: FitnessProfile = {
  goal: "General Fitness",
  age: "25",
  weight: "75",
  height: "175",
  gender: "Male",
  level: "Intermediate",
  workoutType: "Strength",
  equipment: "Full Gym",
  workoutDaysPerWeek: "4",
  sessionDuration: "45",
  activityLevel: "Moderately Active",
  sleepQuality: "Good",
  focusAreas: ["Full Body"],
};

export function SettingsClient({
  name,
  email,
  initialFitnessProfile,
}: {
  name: string;
  email: string;
  initialFitnessProfile: FitnessProfile | null;
}) {
  const [displayName, setDisplayName] = useState(name);
  const [fitnessProfile, setFitnessProfile] = useState<FitnessProfile>(initialFitnessProfile ?? defaultFitnessProfile);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const targets = calculateTargets(fitnessProfile);

  const setProfile = (key: keyof FitnessProfile, value: string) =>
    setFitnessProfile((profile) => ({ ...profile, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName, fitnessProfile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast({ title: "Profile updated.", variant: "success" });
      router.refresh();
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="section-tag">User Settings</div>
        <h1 className="hero-title text-[clamp(2rem,5vw,3rem)]">PROFILE</h1>
      </div>

      <div className="iron-card p-6 mb-6">
        <div className="grid gap-5">
          <div>
            <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
              Display Name
            </label>
            <input
              className="iron-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
            />
          </div>
          <div>
            <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
              Email
            </label>
            <input className="iron-input opacity-70" value={email} disabled />
          </div>
          <button className="btn-primary px-6 py-3 text-xs justify-center sm:w-fit" onClick={save} disabled={saving}>
            <Save size={14} /> {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      <div className="iron-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <Target size={16} className="text-iron-red" />
          <div>
            <div className="font-display font-black text-base uppercase tracking-wide">Fitness Profile</div>
            <div className="font-body text-iron-gray text-xs">Used for plans, calculators, and progress reports.</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ["Age", "age", "number"],
            ["Weight (kg)", "weight", "number"],
            ["Height (cm)", "height", "number"],
            ["Workout Days / Week", "workoutDaysPerWeek", "number"],
          ].map(([label, key, type]) => (
            <div key={key}>
              <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
                {label}
              </label>
              <input
                className="iron-input"
                type={type}
                value={fitnessProfile[key as keyof FitnessProfile]}
                onChange={(e) => setProfile(key as keyof FitnessProfile, e.target.value)}
              />
            </div>
          ))}

          {[
            ["Goal", "goal", ["Fat Loss", "Muscle Gain", "Recomposition", "General Fitness"]],
            ["Gender", "gender", ["Male", "Female", "Other"]],
            ["Fitness Level", "level", ["Beginner", "Intermediate", "Advanced", "Elite"]],
            ["Preference", "workoutType", ["Strength", "HIIT", "Cardio", "Mobility", "Yoga"]],
            ["Equipment", "equipment", ["Full Gym", "Home Gym", "Dumbbells", "Resistance Bands", "No Equipment"]],
            ["Activity Level", "activityLevel", ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"]],
            ["Sleep Quality", "sleepQuality", ["Poor", "Average", "Good", "Excellent"]],
          ].map(([label, key, options]) => (
            <div key={key as string}>
              <label className="block font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-2">
                {label as string}
              </label>
              <select
                className="iron-input"
                value={fitnessProfile[key as keyof FitnessProfile]}
                onChange={(e) => setProfile(key as keyof FitnessProfile, e.target.value)}
              >
                {(options as string[]).map((option) => (
                  <option key={option} value={option} style={{ background: "#111" }}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px mb-6" style={{ background: "var(--iron-border)" }}>
        {[
          ["BMI", `${targets.bmi}`, targets.bmiLabel],
          ["BMR", `${targets.bmr}`, "kcal/day"],
          ["TDEE", `${targets.tdee}`, "kcal/day"],
          ["Calories", `${targets.calorieTarget}`, "daily target"],
          ["Protein", `${targets.proteinTarget}g`, "daily target"],
        ].map(([label, value, sub]) => (
          <div key={label} className="iron-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Calculator size={13} className="text-iron-red" />
              <span className="font-display text-2xs tracking-widest uppercase text-iron-gray">{label}</span>
            </div>
            <div className="font-display font-black text-2xl tracking-tight text-iron-red leading-none">{value}</div>
            <div className="font-body text-iron-gray text-xs mt-2">{sub}</div>
          </div>
        ))}
      </div>

      <div className="iron-card p-6 flex items-start gap-4">
        <div
          className="w-9 h-9 flex items-center justify-center border border-iron-border2 shrink-0"
          style={{ background: "var(--iron-red-glow2)" }}
        >
          <ShieldCheck size={17} className="text-iron-red" />
        </div>
        <div>
          <div className="font-display font-black text-base uppercase tracking-wide mb-1">Account Security</div>
          <p className="font-body text-iron-gray text-sm leading-relaxed">
            Passwords are hashed before storage. Saved plans are only loaded through authenticated, user-scoped routes.
          </p>
        </div>
      </div>

      <div className="iron-card p-6 flex items-start gap-4 mt-6">
        <div
          className="w-9 h-9 flex items-center justify-center border border-iron-border2 shrink-0"
          style={{ background: "var(--iron-red-glow2)" }}
        >
          <Activity size={17} className="text-iron-red" />
        </div>
        <div>
          <div className="font-display font-black text-base uppercase tracking-wide mb-1">Safety Notes</div>
          <p className="font-body text-iron-gray text-sm leading-relaxed">
            Warm up, use proper form, recover between sessions, and consult a qualified professional before training if you have medical issues or injuries.
          </p>
        </div>
      </div>
    </div>
  );
}

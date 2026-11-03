"use client";
import { useState } from "react";
import { PlanView } from "@/components/PlanView";
import { useToast } from "@/components/ui/use-toast";
import type { SavedPlan } from "@/types";
import { CheckCircle, Save } from "lucide-react";

export function PlanDetailsClient({ initialPlan }: { initialPlan: SavedPlan }) {
  const [plan, setPlan] = useState(initialPlan);
  const [completedDays, setCompletedDays] = useState<string[]>(initialPlan.progress?.completedDays ?? []);
  const [notes, setNotes] = useState(initialPlan.progress?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const toggleDay = (day: string) => {
    setCompletedDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day]
    );
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedDays, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Progress update failed");
      setPlan(data.plan);
      toast({ title: "Progress saved.", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-8">
      <PlanView plan={plan.planData} profile={plan.profileData} saved />

      <section className="max-w-[900px] mx-auto px-4 pb-12">
        <div className="iron-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <div className="section-tag">Progress Tracking</div>
              <h2 className="font-display font-black text-xl uppercase tracking-wide">
                Weekly Completion
              </h2>
            </div>
            <button className="btn-primary px-5 py-2 text-xs" onClick={saveProgress} disabled={saving}>
              <Save size={13} /> {saving ? "Saving..." : "Save Progress"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {plan.planData.weeklySchedule.map((day) => (
              <button
                key={day.day}
                className="px-4 py-2 font-display font-bold text-2xs tracking-widest uppercase transition-all border flex items-center gap-2"
                style={{
                  background: completedDays.includes(day.day) ? "var(--iron-red)" : "transparent",
                  borderColor: completedDays.includes(day.day) ? "var(--iron-red)" : "var(--iron-border2)",
                  color: "#fff",
                  opacity: day.isRest ? 0.55 : 1,
                }}
                onClick={() => toggleDay(day.day)}
              >
                {completedDays.includes(day.day) && <CheckCircle size={12} />}
                {day.day.slice(0, 3)}
              </button>
            ))}
          </div>

          <textarea
            className="iron-input min-h-[120px] text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Training notes"
          />
        </div>
      </section>
    </div>
  );
}

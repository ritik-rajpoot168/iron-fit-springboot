"use client";
import { useMemo, useState } from "react";
import type { ElementType } from "react";
import { calculateTargets } from "@/lib/fitness";
import { exportProgressReportAsPDF } from "@/lib/pdf";
import { useToast } from "@/components/ui/use-toast";
import type { FitnessProfile, ProgressRecord } from "@/types";
import { Activity, Download, Plus, Ruler, Save, TrendingDown, Weight } from "lucide-react";

interface Props {
  initialRecords: ProgressRecord[];
  fitnessProfile: FitnessProfile;
}

export function ProgressClient({ initialRecords, fitnessProfile }: Props) {
  const [records, setRecords] = useState(initialRecords);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    date: today,
    weight: fitnessProfile.weight,
    completedWorkouts: "0",
    chest: "",
    waist: "",
    hips: "",
    arms: "",
    thighs: "",
    notes: "",
  });
  const targets = calculateTargets(fitnessProfile);
  const latest = records[0];
  const oldest = records[records.length - 1];
  const weightChange = latest && oldest ? Number(latest.weight) - Number(oldest.weight) : 0;
  const totalWorkouts = records.reduce((sum, record) => sum + record.completedWorkouts, 0);
  const chartRecords = useMemo(() => [...records].slice(0, 8).reverse(), [records]);
  const stats: Array<{ label: string; value: string | number; sub: string; Icon: ElementType }> = [
    { label: "Current Weight", value: latest?.weight ? `${latest.weight}kg` : `${fitnessProfile.weight}kg`, sub: "latest entry", Icon: Weight },
    { label: "BMI", value: `${latest?.bmi ?? targets.bmi}`, sub: targets.bmiLabel, Icon: Activity },
    { label: "Goal", value: fitnessProfile.goal, sub: `${fitnessProfile.workoutDaysPerWeek}/week`, Icon: Plus },
    { label: "Workouts", value: totalWorkouts, sub: "tracked", Icon: Save },
    { label: "Weight Trend", value: `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}kg`, sub: "history", Icon: TrendingDown },
  ];

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          weight: form.weight,
          completedWorkouts: Number(form.completedWorkouts),
          measurements: {
            chest: form.chest,
            waist: form.waist,
            hips: form.hips,
            arms: form.arms,
            thighs: form.thighs,
          },
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Progress save failed");
      setRecords((current) => [data.record, ...current].slice(0, 100));
      toast({ title: "Progress saved.", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const exportReport = async () => {
    setExporting(true);
    try {
      await exportProgressReportAsPDF(fitnessProfile, records);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
        <div>
          <div className="section-tag">Progress Tracker</div>
          <h1 className="hero-title text-[clamp(2rem,5vw,3rem)]">BODY METRICS</h1>
        </div>
        <button className="btn-primary px-6 py-3 text-xs" onClick={exportReport} disabled={exporting}>
          <Download size={14} /> {exporting ? "Exporting..." : "Progress PDF"}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px mb-10" style={{ background: "var(--iron-border)" }}>
        {stats.map(({ label, value, sub, Icon }) => (
          <div key={label} className="iron-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={13} className="text-iron-red" />
              <span className="font-display text-2xs tracking-widest uppercase text-iron-gray">{label}</span>
            </div>
            <div className={`font-display font-black tracking-tight text-iron-red leading-none ${String(value).length > 8 ? "text-lg" : "text-2xl"}`}>{value}</div>
            <div className="font-body text-iron-gray text-xs mt-2">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-px mb-10" style={{ background: "var(--iron-border)" }}>
        <div className="iron-card p-6">
          <div className="font-display font-black text-base uppercase tracking-wide mb-5">Add Progress</div>
          <div className="grid grid-cols-2 gap-4">
            <input className="iron-input" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
            <input className="iron-input" type="number" placeholder="Weight" value={form.weight} onChange={(e) => update("weight", e.target.value)} />
            <input className="iron-input" type="number" placeholder="Completed workouts" value={form.completedWorkouts} onChange={(e) => update("completedWorkouts", e.target.value)} />
            <input className="iron-input" type="number" placeholder="Waist cm" value={form.waist} onChange={(e) => update("waist", e.target.value)} />
            <input className="iron-input" type="number" placeholder="Chest cm" value={form.chest} onChange={(e) => update("chest", e.target.value)} />
            <input className="iron-input" type="number" placeholder="Hips cm" value={form.hips} onChange={(e) => update("hips", e.target.value)} />
            <input className="iron-input" type="number" placeholder="Arms cm" value={form.arms} onChange={(e) => update("arms", e.target.value)} />
            <input className="iron-input" type="number" placeholder="Thighs cm" value={form.thighs} onChange={(e) => update("thighs", e.target.value)} />
          </div>
          <textarea className="iron-input min-h-[90px] text-sm mt-4" placeholder="Progress notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          <button className="btn-primary px-6 py-3 text-xs justify-center mt-4 sm:w-fit" onClick={save} disabled={saving}>
            <Save size={14} /> {saving ? "Saving..." : "Save Progress"}
          </button>
        </div>

        <div className="iron-card p-6">
          <div className="font-display font-black text-base uppercase tracking-wide mb-5">Progress History</div>
          {records.length === 0 ? (
            <div className="py-12 text-center">
              <Ruler size={26} className="text-iron-gray mx-auto mb-3 opacity-60" />
              <div className="font-display font-black text-base uppercase tracking-wide">No progress yet</div>
              <p className="font-body text-iron-gray text-sm mt-2">Add your first body metric entry to start tracking.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.slice(0, 8).map((record) => (
                <div key={record.id} className="border border-iron p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-display font-black uppercase tracking-wide">{record.date}</div>
                    <div className="font-body text-iron-gray text-xs">
                      {record.weight}kg · BMI {record.bmi} · {record.completedWorkouts} workouts
                    </div>
                  </div>
                  <span className="badge">Waist {record.measurements.waist || "-"} cm</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="iron-card p-6">
        <div className="font-display font-black text-base uppercase tracking-wide mb-5">Weight Progress</div>
        <div className="flex items-end gap-2 h-36">
          {chartRecords.length === 0 ? (
            <div className="font-body text-iron-gray text-sm">Progress chart appears after your first record.</div>
          ) : chartRecords.map((record) => {
            const max = Math.max(...chartRecords.map((item) => Number(item.weight)));
            const min = Math.min(...chartRecords.map((item) => Number(item.weight)));
            const height = max === min ? 60 : 35 + ((Number(record.weight) - min) / (max - min)) * 70;
            return (
              <div key={record.id} className="flex-1 min-w-0">
                <div className="bg-iron-red mx-auto" style={{ height: `${height}%`, width: "70%" }} />
                <div className="font-display text-[9px] text-iron-gray text-center mt-2 truncate">{record.date.slice(5)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

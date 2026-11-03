import type { FitnessProfile, NutritionTargets, ProgressRecord } from "@/types";

type PersistedMeasurements = {
  chest?: string | null;
  waist?: string | null;
  hips?: string | null;
  arms?: string | null;
  thighs?: string | null;
};

export function calculateBmi(weightKg: string | number, heightCm: string | number) {
  const weight = Number(weightKg);
  const heightM = Number(heightCm) / 100;
  if (!weight || !heightM) return 0;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

export function bmiLabel(bmi: number) {
  if (!bmi) return "Unknown";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "High";
}

export function calculateBmr(profile: Pick<FitnessProfile, "age" | "gender" | "height" | "weight">) {
  const age = Number(profile.age);
  const height = Number(profile.height);
  const weight = Number(profile.weight);
  if (!age || !height || !weight) return 0;
  const base = 10 * weight + 6.25 * height - 5 * age;
  const modifier = profile.gender === "Female" ? -161 : 5;
  return Math.round(base + modifier);
}

export function activityMultiplier(level: string) {
  if (level === "Elite") return 1.725;
  if (level === "Advanced") return 1.55;
  if (level === "Intermediate") return 1.45;
  return 1.35;
}

export function calculateTargets(profile: FitnessProfile): NutritionTargets {
  const bmi = calculateBmi(profile.weight, profile.height);
  const bmr = calculateBmr(profile);
  const tdee = Math.round(bmr * activityMultiplier(profile.level));
  const weight = Number(profile.weight);
  const calorieTarget =
    profile.goal === "Fat Loss" ? tdee - 400 :
    profile.goal === "Muscle Gain" ? tdee + 250 :
    profile.goal === "Recomposition" ? tdee - 100 :
    tdee;
  const proteinMultiplier = profile.goal === "Muscle Gain" || profile.goal === "Recomposition" ? 1.8 : 1.6;

  return {
    bmi,
    bmr,
    tdee,
    calorieTarget: Math.max(1200, calorieTarget),
    proteinTarget: Math.round(weight * proteinMultiplier),
    bmiLabel: bmiLabel(bmi),
  };
}

export function serializeProgressRecord(record: {
  _id: { toString: () => string };
  date: string;
  weight: string;
  bmi: number;
  measurements?: PersistedMeasurements | null;
  completedWorkouts?: number;
  notes?: string;
  createdAt: Date;
}): ProgressRecord {
  return {
    id: record._id.toString(),
    date: record.date,
    weight: record.weight,
    bmi: record.bmi,
    measurements: {
      chest: record.measurements?.chest ?? "",
      waist: record.measurements?.waist ?? "",
      hips: record.measurements?.hips ?? "",
      arms: record.measurements?.arms ?? "",
      thighs: record.measurements?.thighs ?? "",
    },
    completedWorkouts: record.completedWorkouts ?? 0,
    notes: record.notes ?? "",
    createdAt: record.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

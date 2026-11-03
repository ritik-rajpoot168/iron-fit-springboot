import { z } from "zod";

export const goals = ["Fat Loss", "Muscle Gain", "Recomposition", "General Fitness"] as const;
export const levels = ["Beginner", "Intermediate", "Advanced", "Elite"] as const;
export const workoutTypes = ["Strength", "HIIT", "Cardio", "Mobility", "Yoga"] as const;
export const equipmentTypes = ["Full Gym", "Home Gym", "Dumbbells", "Resistance Bands", "No Equipment", "Gym", "Home"] as const;
export const genders = ["Male", "Female", "Other"] as const;
export const activityLevels = ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"] as const;
export const sleepQualities = ["Poor", "Average", "Good", "Excellent"] as const;
export const focusAreas = ["Chest", "Back", "Arms", "Legs", "Core", "Full Body", "Mobility"] as const;

const numericString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => Number.isFinite(Number(value)), "Must be a number")
    .refine((value) => Number(value) >= min && Number(value) <= max, `Must be between ${min} and ${max}`);

const optionalNumericString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || Number.isFinite(Number(value)), "Must be a number")
    .refine((value) => !value || (Number(value) >= min && Number(value) <= max), `Must be between ${min} and ${max}`);

export const userProfileSchema = z.object({
  goal: z.enum(goals),
  age: numericString(16, 80),
  weight: numericString(40, 160),
  height: numericString(140, 210),
  gender: z.enum(genders),
  level: z.enum(levels),
  workoutType: z.enum(workoutTypes),
  equipment: z.enum(equipmentTypes),
  workoutDaysPerWeek: numericString(2, 6).optional().default("4"),
  sessionDuration: numericString(20, 120).optional().default("45"),
  activityLevel: z.enum(activityLevels).optional().default("Moderately Active"),
  sleepQuality: z.enum(sleepQualities).optional().default("Good"),
  focusAreas: z.array(z.enum(focusAreas)).min(1).max(4).optional().default(["Full Body"]),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(80).optional().or(z.literal("")),
  email: z.string().trim().email().max(160).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
});

export const planNameSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const progressSchema = z.object({
  completedDays: z.array(z.string().trim().max(20)).max(7).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const fitnessProfileSchema = userProfileSchema.extend({
  workoutDaysPerWeek: numericString(2, 6),
  sessionDuration: numericString(20, 120).optional().default("45"),
  activityLevel: z.enum(activityLevels).optional().default("Moderately Active"),
  sleepQuality: z.enum(sleepQualities).optional().default("Good"),
  focusAreas: z.array(z.enum(focusAreas)).min(1).max(4).optional().default(["Full Body"]),
});

export const bodyMeasurementsSchema = z.object({
  chest: optionalNumericString(40, 180),
  waist: optionalNumericString(40, 180),
  hips: optionalNumericString(40, 180),
  arms: optionalNumericString(15, 70),
  thighs: optionalNumericString(25, 100),
});

export const progressRecordSchema = z.object({
  date: z.string().trim().min(1).max(30),
  weight: numericString(40, 160),
  measurements: bodyMeasurementsSchema.default({}),
  completedWorkouts: z.coerce.number().int().min(0).max(14).default(0),
  notes: z.string().trim().max(1000).optional().default(""),
});

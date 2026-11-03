// src/types/index.ts

export interface UserProfile {
  goal: string;
  age: string;
  weight: string;
  height: string;
  gender: string;
  level: string;
  workoutType: string;
  equipment: string;
  workoutDaysPerWeek?: string;
  sessionDuration?: string;
  activityLevel?: string;
  sleepQuality?: string;
  focusAreas?: string[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes: string;
}

export interface DaySchedule {
  day: string;
  focus: string;
  isRest: boolean;
  duration?: string;
  warmup?: string;
  cooldown?: string;
  intensity?: string;
  coachNotes?: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  planName: string;
  overview: string;
  goalSummary?: string;
  userProfileSummary?: string;
  estimatedCaloriesBurned?: string;
  weeklyTrainingTarget?: string;
  weeklySchedule: DaySchedule[];
  warmup: string;
  cooldown: string;
  trainingNotes: string;
  nutritionTip: string;
  weeklyGoal: string;
  recoveryRecommendations?: string;
  sleepRecommendations?: string;
  dailyCalories?: string;
  proteinTarget?: string;
  hydrationGoal?: string;
  progression?: {
    week1to2: string;
    week3to4: string;
    week5to8: string;
  };
  safety?: {
    formTips: string;
    recoveryNotes: string;
  };
}

export interface PlanProgress {
  completedDays: string[];
  notes: string;
  lastUpdatedAt?: string;
}

export interface FitnessProfile extends UserProfile {
  workoutDaysPerWeek: string;
  sessionDuration?: string;
  activityLevel?: string;
  sleepQuality?: string;
  focusAreas?: string[];
}

export interface BodyMeasurements {
  chest?: string;
  waist?: string;
  hips?: string;
  arms?: string;
  thighs?: string;
}

export interface ProgressRecord {
  id: string;
  date: string;
  weight: string;
  bmi: number;
  measurements: BodyMeasurements;
  completedWorkouts: number;
  notes: string;
  createdAt: string;
}

export interface SavedPlan {
  id: string;
  name: string;
  goal: string;
  level: string;
  workoutType: string;
  equipment: string;
  planData: WorkoutPlan;
  profileData: UserProfile;
  progress?: PlanProgress;
  createdAt: string;
}

export type GeneratePhase = "form" | "loading" | "plan";

export interface DashboardStats {
  totalPlans: number;
  totalTrainingDays: number;
  uniqueGoals: number;
  lastPlanDate: string | null;
}

export interface NutritionTargets {
  bmi: number;
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinTarget: number;
  bmiLabel: string;
}

export type ToastVariant = "default" | "destructive" | "success";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

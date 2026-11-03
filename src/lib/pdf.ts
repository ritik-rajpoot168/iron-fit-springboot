// src/lib/pdf.ts
import type { FitnessProfile, ProgressRecord, WorkoutPlan, UserProfile } from "@/types";
import { calculateTargets } from "@/lib/fitness";

export async function exportPlanAsPDF(plan: WorkoutPlan, profile: UserProfile): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210, M = 18;
  let y = M;

  const nl = (n = 5) => { y += n; };
  const checkPage = (needed = 15) => {
    if (y + needed > 278) { doc.addPage(); y = M; pageBg(); }
  };

  const pageBg = () => {
    doc.setFillColor(8, 8, 8);
    doc.rect(0, 0, W, 297, "F");
  };

  const txt = (
    t: string, x: number, size = 10,
    style: "normal" | "bold" = "normal",
    rgb: [number, number, number] = [200, 200, 200]
  ) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    doc.setTextColor(...rgb);
    doc.text(t, x, y);
  };

  pageBg();

  // Red header bar
  doc.setFillColor(229, 57, 53);
  doc.rect(0, 0, W, 36, "F");
  y = 14;
  txt("IRON.FIT", M, 22, "bold", [255, 255, 255]);
  txt("TRAIN · TRACK · TRANSFORM", M, 7, "normal", [255, 180, 180]);
  y = 30;
  txt(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      W - M - 36, 7, "normal", [255, 255, 255]);

  // Plan title
  y = 50;
  txt(plan.planName.toUpperCase(), M, 18, "bold", [255, 255, 255]);
  nl(8);
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  const overLines = doc.splitTextToSize(plan.overview, W - M * 2);
  doc.text(overLines, M, y);
  y += (overLines as string[]).length * 4.5 + 4;

  doc.setDrawColor(40, 40, 40);
  doc.line(M, y, W - M, y); nl(6);

  // Profile
  txt("ATHLETE PROFILE", M, 8, "bold", [229, 57, 53]);
  nl(6);
  const profileFields: [string, string][] = [
    [`Goal: ${profile.goal}`, `Level: ${profile.level}`],
    [`Age: ${profile.age}y`,  `Weight: ${profile.weight}kg`],
    [`Height: ${profile.height}cm`, `Equipment: ${profile.equipment}`],
    [`Workout Days: ${profile.workoutDaysPerWeek ?? "4"}/week`, `Preference: ${profile.workoutType}`],
  ];
  profileFields.forEach(([a, b]) => {
    txt(a, M,      8, "normal", [180, 180, 180]);
    txt(b, M + 80, 8, "normal", [180, 180, 180]);
    nl(5);
  });
  nl(3);
  doc.line(M, y, W - M, y); nl(6);

  // Goal & nutrition
  txt("WEEKLY GOAL", M, 8, "bold", [229, 57, 53]);
  nl(5);
  doc.setFontSize(9); doc.setTextColor(200, 200, 200);
  const goalLines = doc.splitTextToSize(plan.weeklyGoal, W - M * 2);
  doc.text(goalLines, M, y); y += (goalLines as string[]).length * 4.5 + 4;

  txt("PLAN SUMMARY", M, 8, "bold", [229, 57, 53]);
  nl(5);
  const summaryLines = doc.splitTextToSize(
    [
      plan.goalSummary ?? plan.overview,
      plan.userProfileSummary ? `Profile: ${plan.userProfileSummary}` : "",
      plan.estimatedCaloriesBurned ? `Calories: ${plan.estimatedCaloriesBurned}` : "",
      plan.weeklyTrainingTarget ? `Target: ${plan.weeklyTrainingTarget}` : "",
    ].filter(Boolean).join("  "),
    W - M * 2
  );
  doc.text(summaryLines, M, y); y += (summaryLines as string[]).length * 4.5 + 4;

  txt("NUTRITION TIP", M, 8, "bold", [229, 57, 53]);
  nl(5);
  const nutLines = doc.splitTextToSize(plan.nutritionTip, W - M * 2);
  doc.text(nutLines, M, y); y += (nutLines as string[]).length * 4.5 + 4;

  txt("WARMUP", M, 8, "bold", [229, 57, 53]);
  nl(5);
  const warmupLines = doc.splitTextToSize(plan.warmup, W - M * 2);
  doc.text(warmupLines, M, y); y += (warmupLines as string[]).length * 4.5 + 4;

  txt("COOLDOWN", M, 8, "bold", [229, 57, 53]);
  nl(5);
  const cooldownLines = doc.splitTextToSize(plan.cooldown, W - M * 2);
  doc.text(cooldownLines, M, y); y += (cooldownLines as string[]).length * 4.5 + 4;

  txt("TRAINING NOTES", M, 8, "bold", [229, 57, 53]);
  nl(5);
  const notesLines = doc.splitTextToSize(plan.trainingNotes, W - M * 2);
  doc.text(notesLines, M, y); y += (notesLines as string[]).length * 4.5 + 4;

  txt("NUTRITION TARGETS", M, 8, "bold", [229, 57, 53]);
  nl(5);
  const targetLines = doc.splitTextToSize(
    `Daily calories: ${plan.dailyCalories ?? "profile-based"} | Protein: ${plan.proteinTarget ?? "profile-based"} | Hydration: ${plan.hydrationGoal ?? "steady hydration"}`,
    W - M * 2
  );
  doc.text(targetLines, M, y); y += (targetLines as string[]).length * 4.5 + 4;

  txt("PROGRESSION", M, 8, "bold", [229, 57, 53]);
  nl(5);
  const progressionLines = doc.splitTextToSize(
    `Week 1-2: ${plan.progression?.week1to2 ?? "Build consistency."} Week 3-4: ${plan.progression?.week3to4 ?? "Progress gradually."} Week 5-8: ${plan.progression?.week5to8 ?? "Increase load only when recovered."}`,
    W - M * 2
  );
  doc.text(progressionLines, M, y); y += (progressionLines as string[]).length * 4.5 + 4;

  txt("SAFETY NOTES", M, 8, "bold", [229, 57, 53]);
  nl(5);
  const safetyLines = doc.splitTextToSize(
    "Warm up before every workout, use proper form, respect rest and recovery, and consult a qualified professional if you have medical issues, injuries, or unusual symptoms.",
    W - M * 2
  );
  doc.text(safetyLines, M, y); y += (safetyLines as string[]).length * 4.5 + 4;

  doc.line(M, y, W - M, y); nl(6);

  // Schedule
  txt("WEEKLY SCHEDULE", M, 13, "bold", [255, 255, 255]);
  nl(10);

  plan.weeklySchedule.forEach((day) => {
    checkPage(30);

    doc.setFillColor(22, 22, 22);
    doc.rect(M, y - 4, W - M * 2, 11, "F");
    doc.setFillColor(229, 57, 53);
    doc.rect(M, y - 4, 3, 11, "F");

    txt(day.day.toUpperCase(), M + 6, 9, "bold", [229, 57, 53]);
    txt(`${day.focus}${day.duration ? ` · ${day.duration}` : ""}${day.intensity ? ` · ${day.intensity}` : ""}`, M + 40, 9, "normal", [180, 180, 180]);
    nl(12);

    if (day.isRest) {
      txt(day.coachNotes ?? "REST DAY — Recover & Hydrate", M + 3, 8, "normal", [100, 100, 100]);
      nl(10);
      return;
    }

    const dayPrep = doc.splitTextToSize(`Warmup: ${day.warmup ?? plan.warmup} Coach: ${day.coachNotes ?? plan.trainingNotes}`, W - M * 2);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(dayPrep, M + 3, y);
    y += (dayPrep as string[]).length * 3.7 + 3;

    txt("Exercise", M + 3,   7, "bold", [100, 100, 100]);
    txt("Sets",     M + 75,  7, "bold", [100, 100, 100]);
    txt("Reps",     M + 92,  7, "bold", [100, 100, 100]);
    txt("Rest",     M + 115, 7, "bold", [100, 100, 100]);
    txt("Notes",    M + 138, 7, "bold", [100, 100, 100]);
    nl(5);
    doc.setDrawColor(35, 35, 35);
    doc.line(M, y, W - M, y); nl(3);

    day.exercises.forEach((ex, idx) => {
      checkPage(10);
      if (idx % 2 === 0) {
        doc.setFillColor(14, 14, 14);
        doc.rect(M, y - 3, W - M * 2, 8, "F");
      }
      txt(ex.name,              M + 3,   8, "normal", [210, 210, 210]);
      txt(String(ex.sets),      M + 75,  8, "bold",   [229, 57, 53]);
      txt(ex.reps,              M + 92,  8, "normal", [200, 200, 200]);
      txt(ex.rest,              M + 115, 8, "normal", [180, 180, 180]);
      const note = ex.notes.length > 28 ? ex.notes.slice(0, 25) + "…" : ex.notes;
      txt(note,                 M + 138, 7, "normal", [120, 120, 120]);
      nl(8);
    });
    nl(4);
  });

  // Footer
  checkPage(12);
  doc.setFillColor(229, 57, 53);
  doc.rect(0, 285, W, 12, "F");
  y = 292;
  txt("IRON.FIT — EARN THE STRONGEST VERSION OF YOU", M, 7, "bold", [255, 255, 255]);
  txt("ironfit.app", W - M - 20, 7, "normal", [255, 200, 200]);

  doc.save(`${plan.planName.replace(/\s+/g, "_")}_IronFit.pdf`);
}

export async function exportProgressReportAsPDF(profile: FitnessProfile, records: ProgressRecord[]): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, M = 18;
  let y = M;
  const pageBg = () => {
    doc.setFillColor(8, 8, 8);
    doc.rect(0, 0, W, 297, "F");
  };
  const txt = (t: string, x: number, size = 10, style: "normal" | "bold" = "normal", rgb: [number, number, number] = [200, 200, 200]) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    doc.setTextColor(...rgb);
    doc.text(t, x, y);
  };
  const nl = (n = 5) => { y += n; };
  const checkPage = (needed = 15) => {
    if (y + needed > 278) { doc.addPage(); y = M; pageBg(); }
  };

  pageBg();
  doc.setFillColor(229, 57, 53);
  doc.rect(0, 0, W, 36, "F");
  y = 14;
  txt("IRON.FIT", M, 22, "bold", [255, 255, 255]);
  txt("PROGRESS REPORT", M, 7, "normal", [255, 180, 180]);

  const targets = calculateTargets(profile);
  y = 50;
  txt("FITNESS SUMMARY", M, 14, "bold", [255, 255, 255]); nl(8);
  [
    `Goal: ${profile.goal}`,
    `BMI: ${targets.bmi} (${targets.bmiLabel})`,
    `BMR: ${targets.bmr} kcal`,
    `TDEE: ${targets.tdee} kcal`,
    `Daily Calorie Target: ${targets.calorieTarget} kcal`,
    `Protein Target: ${targets.proteinTarget}g/day`,
  ].forEach((line) => { txt(line, M, 9, "normal", [190, 190, 190]); nl(6); });

  nl(4);
  txt("PROGRESS HISTORY", M, 14, "bold", [255, 255, 255]); nl(8);
  if (records.length === 0) {
    txt("No progress records yet.", M, 9, "normal", [140, 140, 140]);
  } else {
    records.forEach((record) => {
      checkPage(18);
      doc.setFillColor(18, 18, 18);
      doc.rect(M, y - 4, W - M * 2, 13, "F");
      txt(`${record.date}  ·  ${record.weight}kg  ·  BMI ${record.bmi}  ·  ${record.completedWorkouts} workouts`, M + 4, 8, "bold", [229, 57, 53]);
      nl(7);
      const summary = `Waist: ${record.measurements.waist || "-"} cm | Chest: ${record.measurements.chest || "-"} cm | Notes: ${record.notes || "-"}`;
      txt(summary.slice(0, 120), M + 4, 7, "normal", [170, 170, 170]);
      nl(10);
    });
  }

  checkPage(18);
  txt("SAFETY NOTE", M, 8, "bold", [229, 57, 53]); nl(5);
  const lines = doc.splitTextToSize("This report is for fitness tracking only. It is not medical advice. Consult a qualified professional if you have medical concerns.", W - M * 2);
  doc.text(lines, M, y);
  doc.save("IronFit_Progress_Report.pdf");
}

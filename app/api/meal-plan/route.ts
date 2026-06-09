import { NextResponse } from "next/server";
import { generateDailyMealPlan } from "@/lib/meal-planner";
import { writeAuditLog } from "@/lib/audit";

export async function POST() {
  const plan = generateDailyMealPlan();

  await writeAuditLog({
    action: "meal_plan.generated",
    resourceType: "meal_plan",
    metadata: {
      title: plan.title,
      date: plan.date,
      totals: plan.totals
    }
  });

  return NextResponse.json({ plan });
}

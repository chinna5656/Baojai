"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { mealPlanItems, mealPlans } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { generateDailyMealPlan } from "@/lib/meal-planner";
import { writeAuditLog } from "@/lib/audit";

const slotMap = {
  Breakfast: "breakfast",
  Lunch: "lunch",
  Dinner: "dinner",
  Snack: "snack"
} as const;

type MealSlot = (typeof slotMap)[keyof typeof slotMap];

function toMealSlot(slot: string): MealSlot {
  return slotMap[slot as keyof typeof slotMap] ?? "snack";
}

export async function generateMealPlanAction() {
  const user = await requireUser();
  const generatedPlan = generateDailyMealPlan();
  const db = getDb();

  const createdPlan = db.transaction((tx) => {
    const plan = tx
      .insert(mealPlans)
      .values({
        userId: user.id,
        planDate: new Date(),
        title: generatedPlan.title,
        rationale: generatedPlan.rationale,
        nutritionTotals: generatedPlan.totals,
        status: "active"
      })
      .returning({ id: mealPlans.id })
      .get();

    for (const item of generatedPlan.items) {
      tx.insert(mealPlanItems)
        .values({
          mealPlanId: plan.id,
          slot: toMealSlot(item.slot),
          menuName: item.menu,
          note: item.note,
          nutrition: {
            sugarG: item.sugarG,
            carbG: item.carbG
          }
        })
        .run();
    }

    return plan;
  });

  await writeAuditLog({
    userId: user.id,
    action: "meal_plan.generated",
    resourceType: "meal_plan",
    resourceId: createdPlan.id,
    metadata: {
      title: generatedPlan.title,
      totals: generatedPlan.totals
    }
  });

  revalidatePath("/meal-plan");
  redirect("/meal-plan?saved=1");
}

export async function toggleMealPlanItemAction(formData: FormData) {
  await requireUser();

  const itemId = String(formData.get("itemId") ?? "");
  const completed = String(formData.get("completed") ?? "") === "true";

  if (!itemId) {
    redirect("/meal-plan?error=missing-item");
  }

  const db = getDb();
  db.update(mealPlanItems)
    .set({ completed: !completed })
    .where(eq(mealPlanItems.id, itemId))
    .run();

  revalidatePath("/meal-plan");
}

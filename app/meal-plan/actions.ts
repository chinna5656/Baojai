"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { foods, glucoseLogs, mealPlanItems, mealPlans } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";

const slotMap = {
  Breakfast: "breakfast",
  Lunch: "lunch",
  Dinner: "dinner",
  Snack: "snack"
} as const;

type ImportedFood = typeof foods.$inferSelect;
type MealSlot = (typeof slotMap)[keyof typeof slotMap];
type PlanStrategy = "balanced" | "lower_carb";

const slotRules = {
  balanced: {
    Breakfast: { minCalories: 50, maxCalories: 360, minCarbG: 8, maxCarbG: 55 },
    Lunch: { minCalories: 80, maxCalories: 520, minCarbG: 10, maxCarbG: 75 },
    Dinner: { minCalories: 70, maxCalories: 460, minCarbG: 8, maxCarbG: 65 },
    Snack: { minCalories: 30, maxCalories: 260, minCarbG: 3, maxCarbG: 35 }
  },
  lower_carb: {
    Breakfast: { minCalories: 50, maxCalories: 340, minCarbG: 3, maxCarbG: 32 },
    Lunch: { minCalories: 70, maxCalories: 460, minCarbG: 5, maxCarbG: 45 },
    Dinner: { minCalories: 60, maxCalories: 420, minCarbG: 3, maxCarbG: 38 },
    Snack: { minCalories: 25, maxCalories: 240, minCarbG: 0, maxCarbG: 22 }
  }
} as const;

function toMealSlot(slot: string): MealSlot {
  return slotMap[slot as keyof typeof slotMap] ?? "snack";
}

function getOptionalString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function parsePlanDate(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "").trim();
  const parsedDate = rawValue ? new Date(`${rawValue}T12:00:00`) : new Date();

  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

function parseMeasuredAt(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return new Date();
  }

  const measuredAt = new Date(rawValue);

  return Number.isNaN(measuredAt.getTime()) ? null : measuredAt;
}

function parseOptionalGlucoseValue(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return null;
  }

  const glucoseValue = Number(rawValue);

  return Number.isFinite(glucoseValue) ? Math.round(glucoseValue) : Number.NaN;
}

function getDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  return { start, end };
}

function parseStrategy(value: FormDataEntryValue | null): PlanStrategy {
  return value === "lower_carb" ? "lower_carb" : "balanced";
}

function chooseFood(candidates: ImportedFood[], usedNames: Set<string>) {
  return candidates.find((food) => !usedNames.has(food.name)) ?? candidates[0];
}

function estimateSugarG(carbG: number) {
  return Number(Math.min(carbG * 0.15, carbG).toFixed(1));
}

function generateMealPlanFromFoods(db: ReturnType<typeof getDb>, strategy: PlanStrategy) {
  const slots = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
  const items = [];
  const usedNames = new Set<string>();

  for (const slot of slots) {
    const rule = slotRules[strategy][slot];
    const candidates = db
      .select()
      .from(foods)
      .where(sql`
        source = 'data.sql'
        and name is not null
        and name <> ''
        and calories between ${rule.minCalories} and ${rule.maxCalories}
        and carb_g between ${rule.minCarbG} and ${rule.maxCarbG}
      `)
      .orderBy(sql`random()`)
      .limit(12)
      .all();
    const food = chooseFood(candidates, usedNames);

    if (!food) {
      return null;
    }

    usedNames.add(food.name);
    items.push({
      foodId: food.id,
      slot,
      menu: food.name,
      note: `${food.glycemicNote || "ข้อมูลโภชนาการนำเข้า"} · ${food.calories ?? 0} kcal, คาร์บ ${food.carbG ?? 0}g ต่อ 100g`,
      sugarG: estimateSugarG(food.carbG ?? 0),
      carbG: food.carbG ?? 0,
      calories: food.calories ?? 0,
      proteinG: food.proteinG ?? 0,
      fatG: food.fatG ?? 0,
      sodiumMg: food.sodiumMg ?? 0
    });
  }

  const totals = items.reduce(
    (result, item) => ({
      sugarG: Number((result.sugarG + item.sugarG).toFixed(1)),
      carbG: Number((result.carbG + item.carbG).toFixed(1)),
      calories: result.calories + item.calories,
      proteinG: Number((result.proteinG + item.proteinG).toFixed(1)),
      sodiumMg: result.sodiumMg + item.sodiumMg
    }),
    { sugarG: 0, carbG: 0, calories: 0, proteinG: 0, sodiumMg: 0 }
  );

  return {
    title: strategy === "lower_carb" ? "แผนอาหารคาร์บต่ำจากฐานข้อมูลอาหาร" : "แผนอาหารสมดุลจากฐานข้อมูลอาหาร",
    rationale:
      strategy === "lower_carb"
        ? "ระบบเลือกอาหารที่คาร์บต่ำกว่าและอยู่ในช่วงพลังงานที่เหมาะกับแต่ละมื้อจากข้อมูล db/data.sql"
        : "ระบบเลือกอาหารแบบสมดุลโดยคุมช่วงคาร์บและพลังงานของแต่ละมื้อจากข้อมูล db/data.sql",
    items,
    totals
  };
}

export async function generateMealPlanAction(formData: FormData) {
  const user = await requireUser();
  const db = getDb();
  const strategy = parseStrategy(formData.get("strategy"));
  const planDate = parsePlanDate(formData.get("planDate"));
  const { start, end } = getDayRange(planDate);
  const generatedPlan = generateMealPlanFromFoods(db, strategy);

  if (!generatedPlan) {
    redirect("/meal-plan?error=not-enough-food-data");
  }

  const createdPlan = db.transaction((tx) => {
    tx.update(mealPlans)
      .set({ status: "archived" })
      .where(and(eq(mealPlans.userId, user.id), gte(mealPlans.planDate, start), lt(mealPlans.planDate, end)))
      .run();

    const plan = tx
      .insert(mealPlans)
      .values({
        userId: user.id,
        planDate,
        title: generatedPlan.title,
        rationale: generatedPlan.rationale,
        nutritionTotals: {
          ...generatedPlan.totals,
          strategyCode: strategy === "lower_carb" ? 1 : 0
        },
        status: "active"
      })
      .returning({ id: mealPlans.id })
      .get();

    for (const item of generatedPlan.items) {
      const extraItemFields = item as Record<string, unknown>;
      const itemValues: typeof mealPlanItems.$inferInsert = {
        mealPlanId: plan.id,
        slot: toMealSlot(item.slot),
        foodId: getOptionalString(extraItemFields.foodId),
        menuName: item.menu,
        note: item.note,
        nutrition: {
          sugarG: item.sugarG,
          carbG: item.carbG,
          calories: getOptionalNumber(extraItemFields.calories),
          proteinG: getOptionalNumber(extraItemFields.proteinG),
          fatG: getOptionalNumber(extraItemFields.fatG),
          sodiumMg: getOptionalNumber(extraItemFields.sodiumMg)
        }
      };

      tx.insert(mealPlanItems).values(itemValues).run();
    }

    return plan;
  });

  await writeAuditLog({
    userId: user.id,
    action: "meal_plan.generated",
    resourceType: "meal_plan",
    resourceId: createdPlan.id,
    metadata: {
      planDate: getDateInputValue(planDate),
      strategy,
      title: generatedPlan.title,
      totals: generatedPlan.totals
    }
  });

  revalidatePath("/meal-plan");
  redirect(`/meal-plan?date=${getDateInputValue(planDate)}&saved=1`);
}

export async function toggleMealPlanItemAction(formData: FormData) {
  const user = await requireUser();

  const itemId = String(formData.get("itemId") ?? "");
  const completed = String(formData.get("completed") ?? "") === "true";
  const selectedDate = String(formData.get("selectedDate") ?? "");
  const glucoseValue = parseOptionalGlucoseValue(formData.get("glucoseValue"));
  const measuredAt = parseMeasuredAt(formData.get("measuredAt"));
  const mealPlanUrl = selectedDate ? `/meal-plan?date=${selectedDate}` : "/meal-plan";
  const mealPlanUrlWithError = (error: string) => `${mealPlanUrl}${selectedDate ? "&" : "?"}error=${error}`;

  if (!itemId) {
    redirect(mealPlanUrlWithError("missing-item"));
  }

  if (glucoseValue !== null && (!Number.isFinite(glucoseValue) || glucoseValue < 20 || glucoseValue > 600)) {
    redirect(mealPlanUrlWithError("invalid-glucose"));
  }

  if (glucoseValue !== null && !measuredAt) {
    redirect(mealPlanUrlWithError("invalid-glucose-time"));
  }

  const db = getDb();
  const item = db
    .select({
      id: mealPlanItems.id,
      menuName: mealPlanItems.menuName,
      slot: mealPlanItems.slot,
      planDate: mealPlans.planDate
    })
    .from(mealPlanItems)
    .innerJoin(mealPlans, eq(mealPlanItems.mealPlanId, mealPlans.id))
    .where(and(eq(mealPlanItems.id, itemId), eq(mealPlans.userId, user.id)))
    .get();

  if (!item) {
    redirect(mealPlanUrlWithError("item-not-found"));
  }

  db.transaction((tx) => {
    tx.update(mealPlanItems)
      .set({ completed: !completed })
      .where(eq(mealPlanItems.id, itemId))
      .run();

    if (!completed && glucoseValue !== null && measuredAt) {
      tx.insert(glucoseLogs)
        .values({
          userId: user.id,
          measuredAt,
          value: glucoseValue,
          context: "after_meal",
          notes: `จากแผนอาหาร: ${item.slot} - ${item.menuName}`
        })
        .run();
    }
  });

  revalidatePath("/meal-plan");
  revalidatePath("/glucose");
  revalidatePath("/dashboard");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { foods, mealTypes } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";

type MealType = (typeof mealTypes)[number];

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getNullableString(formData: FormData, key: string, maxLength = 240) {
  const value = getString(formData, key);

  return value ? value.slice(0, maxLength) : null;
}

function getNullableNumber(formData: FormData, key: string, min = 0, max = 100_000) {
  const rawValue = getString(formData, key);

  if (!rawValue) {
    return null;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value) || value < min || value > max) {
    return null;
  }

  return Number(value.toFixed(1));
}

function getNullableInteger(formData: FormData, key: string, min = 0, max = 100_000) {
  const value = getNullableNumber(formData, key, min, max);

  return value === null ? null : Math.round(value);
}

function parseMealType(value: string): MealType | null {
  return mealTypes.includes(value as MealType) ? (value as MealType) : null;
}

function parseList(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => item.slice(0, 40))
    )
  ).slice(0, 20);
}

export async function addFoodAction(formData: FormData) {
  const user = await requireUser();
  const name = getString(formData, "name").slice(0, 160);
  const mealType = parseMealType(getString(formData, "mealType"));

  if (!name) {
    redirect("/foods?error=missing-name");
  }

  if (!mealType) {
    redirect("/foods?error=invalid-meal-type");
  }

  const foodValues: typeof foods.$inferInsert = {
    source: "manual",
    name,
    servingSizeG: getNullableInteger(formData, "servingSizeG", 1, 5_000),
    calories: getNullableInteger(formData, "calories", 0, 5_000),
    carbG: getNullableNumber(formData, "carbG", 0, 1_000),
    sugarG: getNullableNumber(formData, "sugarG", 0, 1_000),
    proteinG: getNullableNumber(formData, "proteinG", 0, 1_000),
    fatG: getNullableNumber(formData, "fatG", 0, 1_000),
    sodiumMg: getNullableInteger(formData, "sodiumMg", 0, 20_000),
    mealType,
    tags: parseList(getString(formData, "tags")),
    allergens: parseList(getString(formData, "allergens")),
    glycemicNote: getNullableString(formData, "glycemicNote", 500),
    imageUrl: getNullableString(formData, "imageUrl", 500)
  };

  const db = getDb();
  const createdFood = db.insert(foods).values(foodValues).returning({ id: foods.id }).get();

  await writeAuditLog({
    userId: user.id,
    action: "foods.manual.created",
    resourceType: "food",
    resourceId: createdFood.id,
    metadata: {
      name,
      mealType,
      source: "manual"
    }
  });

  revalidatePath("/foods");
  revalidatePath("/meal-plan");
  redirect("/foods?saved=1");
}

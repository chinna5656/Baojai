"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { allergies, userHealthSettings, userProfiles } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";

const allowedSexValues = new Set(["female", "male", "other"]);
const allowedAgeRanges = new Set(["under_18", "18_29", "30_44", "45_59", "60_plus"]);
const allowedDietaryStyles = new Set(["thai_balanced", "lower_carb", "high_protein", "vegetarian"]);

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getLimitedString(formData: FormData, key: string, maxLength: number) {
  return getString(formData, key).slice(0, maxLength);
}

function getNullableString(formData: FormData, key: string, maxLength = 120) {
  const value = getString(formData, key);

  return value ? value.slice(0, maxLength) : null;
}

function getOptionalEnum(formData: FormData, key: string, allowedValues: Set<string>) {
  const value = getString(formData, key);

  if (!value) {
    return null;
  }

  return allowedValues.has(value) ? value : null;
}

function getIntegerInRange(formData: FormData, key: string, fallback: number, min: number, max: number) {
  const rawValue = getString(formData, key);
  const value = rawValue ? Number(rawValue) : fallback;

  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function getNullableIntegerInRange(formData: FormData, key: string, min: number, max: number) {
  const rawValue = getString(formData, key);

  if (!rawValue) {
    return null;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value) || value < min || value > max) {
    return null;
  }

  return Math.round(value);
}

function getNullableNumberInRange(formData: FormData, key: string, min: number, max: number) {
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

function parseAllergies(value: string) {
  return Array.from(
    new Set(
      value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
        .map((item) => item.slice(0, 60))
    )
  ).slice(0, 20);
}

export async function updateSettingsAction(formData: FormData) {
  const user = await requireUser();

  if (user.id === "demo") {
    redirect("/settings?error=demo-readonly");
  }

  const db = getDb();

  const displayName = getLimitedString(formData, "displayName", 80);

  if (!displayName) {
    redirect("/settings?error=missing-name");
  }

  const healthGoal = getNullableString(formData, "healthGoal", 100) ?? "control_glucose";
  const glucoseTargetMin = getIntegerInRange(formData, "glucoseTargetMin", 80, 40, 250);
  const glucoseTargetMax = getIntegerInRange(formData, "glucoseTargetMax", 140, 40, 350);

  if (glucoseTargetMin >= glucoseTargetMax) {
    redirect("/settings?error=invalid-glucose-target");
  }

  const profileValues = {
    displayName,
    ageRange: getOptionalEnum(formData, "ageRange", allowedAgeRanges),
    sex: getOptionalEnum(formData, "sex", allowedSexValues),
    heightCm: getNullableIntegerInRange(formData, "heightCm", 80, 250),
    weightKg: getNullableNumberInRange(formData, "weightKg", 20, 300),
    activityLevel: getNullableString(formData, "activityLevel", 120),
    dietaryStyle: getOptionalEnum(formData, "dietaryStyle", allowedDietaryStyles),
    healthGoals: [healthGoal],
    updatedAt: new Date()
  };

  const healthValues = {
    dailySugarLimitG: getIntegerInRange(formData, "dailySugarLimitG", user.dailySugarLimitG, 1, 150),
    dailyCarbTargetG: getIntegerInRange(formData, "dailyCarbTargetG", user.dailyCarbTargetG, 1, 500),
    sodiumLimitMg: getIntegerInRange(formData, "sodiumLimitMg", user.sodiumLimitMg, 100, 10_000),
    glucoseTargetMin,
    glucoseTargetMax,
    medicalDisclaimerAccepted: formData.get("medicalDisclaimerAccepted") === "on",
    updatedAt: new Date()
  };

  const allergyNames = parseAllergies(getString(formData, "allergies"));

  db.transaction((tx) => {
    const existingProfile = tx.select({ id: userProfiles.id }).from(userProfiles).where(eq(userProfiles.userId, user.id)).get();

    if (existingProfile) {
      tx.update(userProfiles).set(profileValues).where(eq(userProfiles.userId, user.id)).run();
    } else {
      tx.insert(userProfiles)
        .values({
          userId: user.id,
          ...profileValues
        })
        .run();
    }

    const existingHealthSettings = tx
      .select({ id: userHealthSettings.id })
      .from(userHealthSettings)
      .where(eq(userHealthSettings.userId, user.id))
      .get();

    if (existingHealthSettings) {
      tx.update(userHealthSettings).set(healthValues).where(eq(userHealthSettings.userId, user.id)).run();
    } else {
      tx.insert(userHealthSettings)
        .values({
          userId: user.id,
          ...healthValues
        })
        .run();
    }

    tx.delete(allergies).where(eq(allergies.userId, user.id)).run();

    for (const allergyName of allergyNames) {
      tx.insert(allergies)
        .values({
          userId: user.id,
          name: allergyName
        })
        .run();
    }
  });

  await writeAuditLog({
    userId: user.id,
    action: "settings.profile.updated",
    resourceType: "user_profile",
    resourceId: user.id,
    metadata: {
      allergyCount: allergyNames.length,
      dailySugarLimitG: healthValues.dailySugarLimitG,
      dailyCarbTargetG: healthValues.dailyCarbTargetG
    }
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/meal-plan");
  revalidatePath("/glucose");
  redirect("/settings?saved=1");
}

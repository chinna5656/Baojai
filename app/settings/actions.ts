"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { allergies, userHealthSettings, userProfiles } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getNullableString(formData: FormData, key: string) {
  const value = getString(formData, key);

  return value || null;
}

function getInteger(formData: FormData, key: string, fallback: number) {
  const value = Number(getString(formData, key));

  return Number.isFinite(value) ? Math.round(value) : fallback;
}

function getNullableInteger(formData: FormData, key: string) {
  const rawValue = getString(formData, key);

  if (!rawValue) {
    return null;
  }

  const value = Number(rawValue);

  return Number.isFinite(value) ? Math.round(value) : null;
}

function getNullableNumber(formData: FormData, key: string) {
  const rawValue = getString(formData, key);

  if (!rawValue) {
    return null;
  }

  const value = Number(rawValue);

  return Number.isFinite(value) ? value : null;
}

function parseAllergies(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export async function updateSettingsAction(formData: FormData) {
  const user = await requireUser();
  const db = getDb();

  const displayName = getString(formData, "displayName");

  if (!displayName) {
    redirect("/settings?error=missing-name");
  }

  const profileValues = {
    displayName,
    ageRange: getNullableString(formData, "ageRange"),
    sex: getNullableString(formData, "sex"),
    heightCm: getNullableInteger(formData, "heightCm"),
    weightKg: getNullableNumber(formData, "weightKg"),
    activityLevel: getNullableString(formData, "activityLevel"),
    dietaryStyle: getNullableString(formData, "dietaryStyle"),
    healthGoals: [getNullableString(formData, "healthGoal") ?? "control_glucose"],
    updatedAt: new Date()
  };

  const healthValues = {
    dailySugarLimitG: getInteger(formData, "dailySugarLimitG", user.dailySugarLimitG),
    dailyCarbTargetG: getInteger(formData, "dailyCarbTargetG", user.dailyCarbTargetG),
    sodiumLimitMg: getInteger(formData, "sodiumLimitMg", user.sodiumLimitMg),
    glucoseTargetMin: getInteger(formData, "glucoseTargetMin", 80),
    glucoseTargetMax: getInteger(formData, "glucoseTargetMax", 140),
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

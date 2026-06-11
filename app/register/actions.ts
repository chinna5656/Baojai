"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { allergies, userHealthSettings, userProfiles, users } from "@/db/schema";
import { hashPassword, SESSION_COOKIE } from "@/lib/auth";

function toPositiveNumber(value: FormDataEntryValue | null) {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const age = toPositiveNumber(formData.get("age"));
  const sex = String(formData.get("sex") ?? "").trim();
  const weight = toPositiveNumber(formData.get("weight"));
  const height = toPositiveNumber(formData.get("height"));
  const diabetesType = String(formData.get("diabetesType") ?? "");
  const sugarTarget = toPositiveNumber(formData.get("sugarTarget")) ?? 140;
  const allergyNames = String(formData.get("allergies") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!name || !email || !password) {
    redirect("/register?error=missing");
  }

  const db = getDb();
  const existingUser = db.select({ id: users.id }).from(users).where(eq(users.email, email)).get();

  if (existingUser) {
    redirect("/register?error=email-exists");
  }

  const createdUser = db.transaction((tx) => {
    const newUser = tx
      .insert(users)
      .values({
        email,
        passwordHash: hashPassword(password)
      })
      .returning({ id: users.id })
      .get();

    tx.insert(userProfiles)
      .values({
        userId: newUser.id,
        displayName: name,
        ageRange: age ? String(Math.round(age)) : null,
        sex: sex || null,
        heightCm: height ? Math.round(height) : null,
        weightKg: weight,
        activityLevel: diabetesType || null,
        healthGoals: ["control_glucose"],
        dietaryStyle: "thai_health"
      })
      .run();

    tx.insert(userHealthSettings)
      .values({
        userId: newUser.id,
        glucoseTargetMax: Math.round(sugarTarget),
        medicalDisclaimerAccepted: true
      })
      .run();

    for (const allergyName of allergyNames) {
      tx.insert(allergies)
        .values({
          userId: newUser.id,
          name: allergyName
        })
        .run();
    }

    return newUser;
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createdUser.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

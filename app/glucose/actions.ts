"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { glucoseLogs, glucoseContexts } from "@/db/schema";
import { requireUser } from "@/lib/auth";

type GlucoseContext = (typeof glucoseContexts)[number];

function parseContext(value: FormDataEntryValue | null): GlucoseContext {
  const context = String(value ?? "other");

  return glucoseContexts.includes(context as GlucoseContext) ? (context as GlucoseContext) : "other";
}

function parseMeasuredAt(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return new Date();
  }

  const measuredAt = new Date(rawValue);

  return Number.isNaN(measuredAt.getTime()) ? null : measuredAt;
}

export async function logGlucoseAction(formData: FormData) {
  const user = await requireUser();
  const value = Number(formData.get("glucoseValue"));
  const context = parseContext(formData.get("context"));
  const measuredAt = parseMeasuredAt(formData.get("measuredAt"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!Number.isFinite(value) || value < 20 || value > 600) {
    redirect("/glucose?error=invalid-value");
  }

  if (!measuredAt) {
    redirect("/glucose?error=invalid-time");
  }

  const db = getDb();

  db.insert(glucoseLogs)
    .values({
      userId: user.id,
      measuredAt,
      value: Math.round(value),
      context,
      notes: notes || null
    })
    .run();

  revalidatePath("/glucose");
  revalidatePath("/dashboard");
  redirect("/glucose?saved=1");
}

export async function deleteGlucoseLogAction(formData: FormData) {
  const user = await requireUser();
  const logId = String(formData.get("logId") ?? "").trim();

  if (!logId) {
    redirect("/glucose?error=missing-log");
  }

  const db = getDb();
  db.delete(glucoseLogs)
    .where(and(eq(glucoseLogs.id, logId), eq(glucoseLogs.userId, user.id)))
    .run();

  revalidatePath("/glucose");
  revalidatePath("/dashboard");
  redirect("/glucose?deleted=1");
}

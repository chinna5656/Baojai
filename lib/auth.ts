import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getDb } from "@/db/client";
import { allergies, userHealthSettings, userProfiles, users } from "@/db/schema";
import { demoUser } from "@/lib/mock-data";

export const SESSION_COOKIE = "baojai_session";

export type SessionUser = typeof demoUser;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) {
    return false;
  }

  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const passwordHash = scryptSync(password, salt, 64);
  const storedPasswordHash = Buffer.from(hash, "hex");

  return (
    passwordHash.length === storedPasswordHash.length &&
    timingSafeEqual(passwordHash, storedPasswordHash)
  );
}

function formatGlucoseTarget(min?: number, max?: number) {
  return `${min ?? 80}-${max ?? 140} mg/dL`;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!userId) {
    return null;
  }

  if (userId === "demo") {
    return demoUser;
  }

  const db = getDb();
  const user = db.select().from(users).where(eq(users.id, userId)).get();

  if (!user) {
    return null;
  }

  const profile = db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).get();
  const settings = db
    .select()
    .from(userHealthSettings)
    .where(eq(userHealthSettings.userId, user.id))
    .get();
  const userAllergies = db.select().from(allergies).where(eq(allergies.userId, user.id)).all();

  return {
    id: user.id,
    name: profile?.displayName ?? user.email,
    email: user.email,
    goal: profile?.healthGoals?.[0] ?? demoUser.goal,
    dailySugarLimitG: settings?.dailySugarLimitG ?? demoUser.dailySugarLimitG,
    dailyCarbTargetG: settings?.dailyCarbTargetG ?? demoUser.dailyCarbTargetG,
    sodiumLimitMg: settings?.sodiumLimitMg ?? demoUser.sodiumLimitMg,
    allergies: userAllergies.map((allergy) => allergy.name),
    dietaryStyle: profile?.dietaryStyle ?? demoUser.dietaryStyle,
    glucoseTarget: formatGlucoseTarget(settings?.glucoseTargetMin, settings?.glucoseTargetMax)
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

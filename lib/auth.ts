import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { demoUser } from "@/lib/mock-data";

export const SESSION_COOKIE = "baojai_session";

export type SessionUser = typeof demoUser;

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  if (session === "demo") {
    return demoUser;
  }

  return null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

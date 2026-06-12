import { desc, eq } from "drizzle-orm";
import { Database, KeyRound, Settings2, UserRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/SectionTitle";
import { getDb } from "@/db/client";
import { allergies, auditLogs, userHealthSettings, userProfiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { sheetSources } from "@/lib/mock-data";

function displayValue(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function formatDateTime(date: Date) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);

  return formatted.replace(":", ".");
}

export default async function SettingsPage() {
  const user = await requireUser();
  const db = getDb();
  const profile = db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).get();
  const healthSettings = db
    .select()
    .from(userHealthSettings)
    .where(eq(userHealthSettings.userId, user.id))
    .get();
  const userAllergies = db.select().from(allergies).where(eq(allergies.userId, user.id)).all();
  const recentAuditLogs = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(5).all();

  const profileRows = [
    ["Name", user.name],
    ["Email", user.email],
    ["Sex", profile?.sex],
    ["Age", profile?.ageRange],
    ["Height", profile?.heightCm ? `${profile.heightCm} cm` : null],
    ["Weight", profile?.weightKg ? `${profile.weightKg} kg` : null],
    ["Diabetes type", profile?.activityLevel],
    ["Dietary style", profile?.dietaryStyle ?? user.dietaryStyle],
    ["Allergies", userAllergies.length > 0 ? userAllergies.map((item) => item.name).join(", ") : null]
  ];

  const targetRows = [
    ["Daily sugar", `${healthSettings?.dailySugarLimitG ?? user.dailySugarLimitG} g`],
    ["Daily carb", `${healthSettings?.dailyCarbTargetG ?? user.dailyCarbTargetG} g`],
    ["Sodium", `${healthSettings?.sodiumLimitMg ?? user.sodiumLimitMg} mg`],
    ["Glucose target", user.glucoseTarget],
    ["Medical disclaimer", healthSettings?.medicalDisclaimerAccepted ? "Accepted" : "Not accepted"]
  ];

  const envRows = [
    ["SQLITE_DB_PATH", process.env.SQLITE_DB_PATH ?? "./db/baojai.sqlite"],
    ["AUTH_SECRET", process.env.AUTH_SECRET ? "Configured" : "Missing"],
    ["GOOGLE_SERVICE_ACCOUNT_EMAIL", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "Configured" : "Missing"],
    ["GOOGLE_PRIVATE_KEY", process.env.GOOGLE_PRIVATE_KEY ? "Configured" : "Missing"],
    ["GOOGLE_SHEET_ID", process.env.GOOGLE_SHEET_ID ? "Configured" : "Missing"],
    ["OPENAI_API_KEY", process.env.OPENAI_API_KEY ? "Configured" : "Missing"]
  ];

  return (
    <AppShell active="settings" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionTitle
          eyebrow="Settings"
          title="Profile And Data Settings"
          detail="Review your saved profile, health targets, SQLite database setup, Google Sheets source, and recent audit activity."
        />

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <UserRound className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">Profile</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {profileRows.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
                  <p className="mt-1 font-bold text-slate-950">{displayValue(value)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Settings2 className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">Health Targets</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {targetRows.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
                  <p className="mt-1 font-bold text-slate-950">{displayValue(value)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Database className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">Data Sources</h2>
            </div>
            <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {sheetSources.map((source) => (
                <div key={source.name} className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="font-bold text-slate-950">{source.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {source.range} · sync {source.lastSync}
                    </p>
                  </div>
                  <span className="self-start rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                    {source.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <KeyRound className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">Environment</h2>
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              {envRows.map(([label, value]) => (
                <div key={label} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <code className="font-semibold text-slate-700">{label}</code>
                  <span className={value === "Missing" ? "font-bold text-red-700" : "font-bold text-emerald-700"}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="baojai-card rounded-lg p-5">
          <h2 className="text-xl font-bold text-slate-950">Recent Audit Logs</h2>
          <div className="mt-4 grid gap-3">
            {recentAuditLogs.length > 0 ? (
              recentAuditLogs.map((event) => (
                <div key={event.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-slate-950">{event.action}</p>
                    <span className="text-xs font-bold text-slate-500">{formatDateTime(event.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {displayValue(event.resourceType, "system")}
                    {event.resourceId ? ` · ${event.resourceId}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500">
                No audit logs saved yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

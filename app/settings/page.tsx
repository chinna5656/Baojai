import { desc, eq } from "drizzle-orm";
import { Database, KeyRound, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/SectionTitle";
import { getDb } from "@/db/client";
import { allergies, auditLogs, userHealthSettings, userProfiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { sheetSources } from "@/lib/mock-data";
import { SettingsProfileForm } from "./SettingsProfileForm";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const dietaryLabels: Record<string, string> = {
  thai_balanced: "อาหารไทยสมดุล",
  lower_carb: "คาร์บต่ำ",
  high_protein: "โปรตีนสูง",
  vegetarian: "มังสวิรัติ"
};

function displayValue(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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

function parseGlucoseTarget(target: string) {
  const [min, max] = target.match(/\d+/g)?.map(Number) ?? [80, 140];

  return { min: min ?? 80, max: max ?? 140 };
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-900/10 bg-white p-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{displayValue(value)}</p>
    </div>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : {};
  const isEditing = getParamValue(params.mode) === "edit";
  const db = getDb();
  const profile = db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).get();
  const healthSettings = db
    .select()
    .from(userHealthSettings)
    .where(eq(userHealthSettings.userId, user.id))
    .get();
  const userAllergies = db.select().from(allergies).where(eq(allergies.userId, user.id)).all();
  const recentAuditLogs = db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, user.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(5)
    .all();

  const glucoseTarget = parseGlucoseTarget(user.glucoseTarget);
  const allergyText = userAllergies.map((item) => item.name).join(", ");
  const displayName = profile?.displayName ?? user.name;
  const dailySugarLimitG = healthSettings?.dailySugarLimitG ?? user.dailySugarLimitG;
  const dailyCarbTargetG = healthSettings?.dailyCarbTargetG ?? user.dailyCarbTargetG;
  const sodiumLimitMg = healthSettings?.sodiumLimitMg ?? user.sodiumLimitMg;
  const glucoseTargetMin = healthSettings?.glucoseTargetMin ?? glucoseTarget.min;
  const glucoseTargetMax = healthSettings?.glucoseTargetMax ?? glucoseTarget.max;
  const envRows = [
    ["SQLITE_DB_PATH", process.env.SQLITE_DB_PATH ?? "./db/baojai.sqlite"],
    ["AUTH_SECRET", process.env.AUTH_SECRET ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า"],
    ["GOOGLE_SERVICE_ACCOUNT_EMAIL", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า"],
    ["GOOGLE_PRIVATE_KEY", process.env.GOOGLE_PRIVATE_KEY ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า"],
    ["GOOGLE_SHEET_ID", process.env.GOOGLE_SHEET_ID ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า"],
    ["OLLAMA_BASE_URL", process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434"],
    ["OLLAMA_MODEL", process.env.OLLAMA_MODEL ?? "llama3.1"]
  ];

  return (
    <AppShell active="settings" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionTitle
          eyebrow="Settings"
          title="ข้อมูลโปรไฟล์สุขภาพ"
          detail="ข้อมูลถูกล็อกไว้ก่อนแก้ไข กดปุ่มแก้ไขข้อมูลเพื่อเปลี่ยนโปรไฟล์และเป้าหมายสุขภาพ"
        />

        {getParamValue(params.saved) === "1" ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว
          </div>
        ) : null}

        {getParamValue(params.error) === "missing-name" ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            กรุณากรอกชื่อที่ต้องการแสดง
          </div>
        ) : null}

        {getParamValue(params.error) === "invalid-glucose-target" ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            ค่า Glucose ต่ำสุดต้องน้อยกว่าค่าสูงสุด
          </div>
        ) : null}

        {getParamValue(params.error) === "demo-readonly" ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            บัญชีตัวอย่างใช้ดูข้อมูลเท่านั้น กรุณาสมัครหรือเข้าสู่ระบบด้วยบัญชีจริงเพื่อแก้ไขโปรไฟล์
          </div>
        ) : null}

        <section className="grid gap-4 rounded-lg border border-emerald-900/10 bg-emerald-50 p-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-emerald-700 text-xl font-bold text-white">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700">Profile summary</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{displayName}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-lg bg-white px-2 py-1 text-emerald-800">
                  {dietaryLabels[profile?.dietaryStyle ?? ""] ?? "ยังไม่ระบุรูปแบบอาหาร"}
                </span>
                <span className="rounded-lg bg-white px-2 py-1 text-slate-700">{allergyText || "ไม่มีข้อมูลแพ้อาหาร"}</span>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryItem label="น้ำตาล/วัน" value={`${dailySugarLimitG} g`} />
            <SummaryItem label="คาร์บ/วัน" value={`${dailyCarbTargetG} g`} />
            <SummaryItem label="โซเดียม/วัน" value={`${sodiumLimitMg} mg`} />
            <SummaryItem label="Glucose target" value={`${glucoseTargetMin}-${glucoseTargetMax} mg/dL`} />
          </div>
        </section>

        <SettingsProfileForm
          activityLevel={profile?.activityLevel ?? ""}
          ageRange={profile?.ageRange ?? ""}
          allergyText={allergyText}
          dailyCarbTargetG={dailyCarbTargetG}
          dailySugarLimitG={dailySugarLimitG}
          dietaryStyle={profile?.dietaryStyle ?? user.dietaryStyle ?? ""}
          displayName={displayName}
          email={user.email}
          glucoseTargetMax={glucoseTargetMax}
          glucoseTargetMin={glucoseTargetMin}
          healthGoal={profile?.healthGoals?.[0] ?? user.goal}
          heightCm={profile?.heightCm ?? null}
          isEditing={isEditing}
          medicalDisclaimerAccepted={healthSettings?.medicalDisclaimerAccepted ?? false}
          sex={profile?.sex ?? ""}
          sodiumLimitMg={sodiumLimitMg}
          weightKg={profile?.weightKg ?? null}
        />

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Database className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">แหล่งข้อมูล</h2>
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
              <h2 className="text-xl font-bold text-slate-950">สภาพแวดล้อมระบบ</h2>
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              {envRows.map(([label, value]) => (
                <div key={label} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <code className="font-semibold text-slate-700">{label}</code>
                  <span className={value === "ยังไม่ตั้งค่า" ? "font-bold text-red-700" : "font-bold text-emerald-700"}>{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="baojai-card rounded-lg p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-700" size={22} />
            <h2 className="text-xl font-bold text-slate-950">ประวัติการใช้งานล่าสุด</h2>
          </div>
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
                ยังไม่มี audit log สำหรับผู้ใช้นี้
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

import { Database, KeyRound, UserRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/SectionTitle";
import { requireUser } from "@/lib/auth";
import { auditEvents, sheetSources } from "@/lib/mock-data";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <AppShell active="settings" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionTitle
          eyebrow="Settings"
          title="โปรไฟล์ เป้าหมาย และแหล่งข้อมูล"
          detail="ตั้งค่าเป้าหมายน้ำตาล สารก่อแพ้ และ Google Sheets source สำหรับนำเข้าข้อมูลอาหาร/เมนู/กฎความเสี่ยง"
        />

        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <UserRound className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">โปรไฟล์ผู้ใช้</h2>
            </div>
            <div className="mt-5 grid gap-4">
              {[
                ["ชื่อ", user.name],
                ["อีเมล", user.email],
                ["เป้าหมาย", user.goal],
                ["รูปแบบอาหาร", user.dietaryStyle],
                ["สารก่อแพ้", user.allergies.join(", ")],
                ["กรอบ glucose", user.glucoseTarget]
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold text-slate-500">{label}</p>
                  <p className="mt-1 font-bold text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Database className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">Google Sheets data source</h2>
            </div>
            <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {sheetSources.map((source) => (
                <div key={source.name} className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="font-bold text-slate-950">{source.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{source.range} · sync {source.lastSync}</p>
                  </div>
                  <span className="self-start rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                    {source.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="focus-ring mt-5 h-11 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800" type="button">
              Sync Google Sheets
            </button>
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <KeyRound className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">Environment variables</h2>
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              {["DATABASE_URL", "AUTH_SECRET", "GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY", "GOOGLE_SHEET_ID", "OPENAI_API_KEY"].map((item) => (
                <code key={item} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700">
                  {item}
                </code>
              ))}
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <h2 className="text-xl font-bold text-slate-950">Audit logs ล่าสุด</h2>
            <div className="mt-4 grid gap-3">
              {auditEvents.map((event) => (
                <div key={`${event.action}-${event.time}`} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-slate-950">{event.action}</p>
                    <span className="text-xs font-bold text-slate-500">{event.time}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{event.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

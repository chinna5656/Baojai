import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Database, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { MiniTrendChart } from "@/components/MiniTrendChart";
import { SectionTitle } from "@/components/SectionTitle";
import { requireUser } from "@/lib/auth";
import {
  dashboardInsight,
  glucosePoints,
  metrics,
  quickActions,
  recentMeals,
  riskAlerts,
  sheetSources
} from "@/lib/mock-data";

export default async function DashboardPage() {
  const user = await requireUser();
  const InsightIcon = dashboardInsight.icon;

  return (
    <AppShell active="dashboard" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-5 xl:grid-cols-[1.55fr_0.95fr]">
          <section className="relative min-h-[330px] overflow-hidden rounded-lg border border-emerald-900/10 bg-emerald-950 text-white shadow-2xl shadow-emerald-950/10">
            <Image
              src="/baojai-hero.png"
              alt="อาหารสุขภาพและอุปกรณ์ติดตามน้ำตาล"
              fill
              className="object-cover opacity-75"
              priority
              sizes="(min-width: 1280px) 60vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/78 to-emerald-950/20" />
            <div className="relative flex min-h-[330px] max-w-2xl flex-col justify-between p-6 sm:p-8">
              <div>
                <p className="text-sm font-bold text-emerald-200">Dashboard สุขภาพวันนี้</p>
                <h1 className="mt-3 text-4xl font-bold sm:text-5xl">สวัสดี {user.name}</h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-emerald-50">
                  Baojai สรุปอาหาร น้ำตาล และแผนมื้อถัดไปให้คุณตัดสินใจได้เร็วขึ้น โดยไม่แทนคำวินิจฉัยทางการแพทย์
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="focus-ring inline-flex h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50"
                  href="/food-log"
                >
                  บันทึกอาหาร
                  <ArrowRight size={17} />
                </Link>
                <Link
                  className="focus-ring inline-flex h-11 items-center gap-2 rounded-lg border border-white/35 px-4 text-sm font-bold text-white transition hover:bg-white/12"
                  href="/label"
                >
                  วิเคราะห์ฉลาก
                  <Sparkles size={17} />
                </Link>
              </div>
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-700">Insight อัตโนมัติ</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">{dashboardInsight.title}</h2>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                <InsightIcon size={22} />
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{dashboardInsight.detail}</p>

            <div className="mt-6 rounded-lg border border-emerald-900/10 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                <Database size={18} />
                Google Sheets source
              </div>
              <div className="mt-4 grid gap-3">
                {sheetSources.map((source) => (
                  <div key={source.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-700">{source.name}</span>
                    <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-emerald-800">{source.rows} rows</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="baojai-card rounded-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle
                eyebrow="Glucose trend"
                title="แนวโน้มระดับน้ำตาลในเลือด"
                detail="พื้นที่สีเขียวคือกรอบเป้าหมายที่ตั้งไว้ในโปรไฟล์ผู้ใช้"
              />
              <Link className="text-sm font-bold text-emerald-700 hover:text-emerald-900" href="/glucose">
                ดูรายละเอียด
              </Link>
            </div>
            <div className="mt-4 h-60 rounded-lg border border-emerald-900/10 bg-white p-4">
              <MiniTrendChart points={glucosePoints} />
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <SectionTitle eyebrow="Quick actions" title="เริ่มงานประจำวัน" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="focus-ring flex min-h-[92px] flex-col justify-between rounded-lg border border-emerald-900/10 bg-white p-3 text-sm font-bold text-slate-700 transition hover:border-emerald-700 hover:text-emerald-800 hover:shadow-lg hover:shadow-emerald-900/10"
                  >
                    <Icon size={20} />
                    <span>{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="baojai-card rounded-lg p-5">
            <SectionTitle eyebrow="Food log" title="อาหารล่าสุด" detail="คำนวณน้ำตาลและคาร์บจากรายการที่บันทึกไว้" />
            <div className="mt-4 grid gap-3">
              {recentMeals.map((meal) => (
                <div key={meal.time} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="font-bold text-slate-900">{meal.meal}</p>
                    <p className="mt-1 text-sm text-slate-500">{meal.time} น. · {meal.status}</p>
                  </div>
                  <div className="flex gap-2 text-sm font-bold">
                    <span className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">น้ำตาล {meal.sugarG}g</span>
                    <span className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">คาร์บ {meal.carbG}g</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <SectionTitle eyebrow="Risk alerts" title="อาหารที่ควรระวัง" detail="เตือนจากฉลาก ข้อมูลผู้ใช้ และกฎจาก Google Sheets" />
            <div className="mt-4 grid gap-3">
              {riskAlerts.map((alert) => (
                <div key={alert.title} className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20} />
                  <div>
                    <p className="font-bold text-amber-950">{alert.title}</p>
                    <p className="mt-1 text-sm leading-6 text-amber-900">{alert.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

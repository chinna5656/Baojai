import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Database,
  Gauge,
  Leaf,
  LineChart,
  Menu,
  MessageCircle,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Utensils
} from "lucide-react";

const productNav = [
  { label: "วิเคราะห์ฉลาก", href: "#labeling" },
  { label: "Diet Analysis", href: "#analysis" },
  { label: "Menu Creation", href: "#meal-plan" },
  { label: "Google Sheets", href: "#database" }
];

const offeringCards = [
  {
    title: "Food Labeling",
    subtitle: "วิเคราะห์ฉลากโภชนาการ",
    detail: "อ่านค่าน้ำตาล คาร์บ โซเดียม และสารก่อแพ้ แล้วเตือนอาหารเสี่ยงตามเป้าหมายผู้ใช้",
    icon: ScanLine,
    href: "#labeling"
  },
  {
    title: "Diet Analysis",
    subtitle: "วิเคราะห์พฤติกรรมการกิน",
    detail: "รวม food log และ glucose log เพื่อมองเห็นแนวโน้มระดับน้ำตาลหลังอาหาร",
    icon: LineChart,
    href: "#analysis"
  },
  {
    title: "Menu Creation",
    subtitle: "สร้างแผนอาหารอัตโนมัติ",
    detail: "แนะนำมื้อรายวันตามงบน้ำตาล คาร์บ สารก่อแพ้ และข้อมูลจาก Google Sheets",
    icon: CalendarDays,
    href: "#meal-plan"
  }
];

const featureRows = [
  {
    id: "labeling",
    eyebrow: "Food Labeling",
    title: "ฉลากอาหารที่เข้าใจง่ายสำหรับคนคุมน้ำตาล",
    intro:
      "Baojai เปลี่ยนตัวเลขบนฉลากให้เป็นคำเตือนภาษาไทยที่ลงมือทำได้ทันที ทั้งน้ำตาลสูง โซเดียมสูง คาร์บต่อเสิร์ฟ และสารก่อแพ้ส่วนบุคคล",
    icon: ScanLine,
    stats: [
      ["Risk score", "45"],
      ["น้ำตาล", "18g"],
      ["คำเตือน", "สูง"]
    ],
    bullets: [
      "รองรับการกรอกฉลากด้วยมือและต่อยอดเป็น OCR image upload",
      "เทียบกับ daily sugar limit และ risk_rules จาก Google Sheets",
      "บันทึกผลวิเคราะห์และเหตุการณ์สำคัญลง audit log"
    ]
  },
  {
    id: "analysis",
    eyebrow: "Diet Analysis",
    title: "วิเคราะห์อาหารที่กินกับแนวโน้มระดับน้ำตาล",
    intro:
      "หน้า Dashboard รวมอาหารล่าสุด งบน้ำตาล คาร์บ และกราฟ glucose เพื่อช่วยให้ผู้ใช้เห็นรูปแบบหลังอาหารโดยไม่แทนคำวินิจฉัยแพทย์",
    icon: Gauge,
    stats: [
      ["น้ำตาลวันนี้", "17g"],
      ["คาร์บ", "112g"],
      ["Glucose", "126"]
    ],
    bullets: [
      "บันทึกมื้อเช้า กลางวัน เย็น ของว่าง และเครื่องดื่ม",
      "วิเคราะห์ daily/weekly/monthly glucose trends",
      "เชื่อมโยงอาหารกับค่าน้ำตาลเมื่อ timestamps ใกล้กัน"
    ]
  },
  {
    id: "meal-plan",
    eyebrow: "Menu Creation",
    title: "สร้างแผนอาหารรายวันที่ปรับตามข้อมูลผู้ใช้",
    intro:
      "ระบบเลือกเมนูที่เหมาะกับเป้าหมายสุขภาพ งบน้ำตาล สารก่อแพ้ ประวัติอาหาร และแนวโน้ม glucose แล้วแสดงเหตุผลของแต่ละเมนู",
    icon: Utensils,
    stats: [
      ["มื้อ", "4"],
      ["น้ำตาลรวม", "23g"],
      ["คะแนนเมนู", "92"]
    ],
    bullets: [
      "แนะนำ breakfast, lunch, dinner และ snack รายวัน",
      "รองรับการ swap เมนูและบันทึก plan status",
      "ใช้เมนูจาก database และแหล่ง Google Sheets"
    ]
  }
];

const workflowSteps = [
  { title: "เข้าสู่ระบบ", detail: "แยกข้อมูลสุขภาพตามผู้ใช้", icon: ShieldCheck },
  { title: "นำเข้าข้อมูล", detail: "foods, menus, risk_rules จาก Google Sheets", icon: Database },
  { title: "บันทึกและวิเคราะห์", detail: "food log, sugar budget, glucose trend", icon: ClipboardList },
  { title: "แนะนำอัตโนมัติ", detail: "meal plan และ chatbot safety boundary", icon: Bot }
];

const trustItems = ["Neon Postgres บน Vercel", "Auth + protected routes", "Audit logs", "Google Sheets API", "Thai-first UI", "Health safety boundary"];

const testimonials = [
  {
    name: "คลินิกโภชนาการชุมชน",
    quote: "Baojai ช่วยเปลี่ยนข้อมูลอาหารให้เป็นคำแนะนำที่ผู้ใช้เข้าใจง่าย โดยเฉพาะการคุมเครื่องดื่มหวานช่วงบ่าย"
  },
  {
    name: "ทีมดูแลสุขภาพองค์กร",
    quote: "Dashboard ทำให้เห็น food log และแนวโน้มน้ำตาลในเลือดในภาพเดียว เหมาะกับการติดตามพฤติกรรมระยะยาว"
  },
  {
    name: "ผู้ดูแลฐานข้อมูลเมนู",
    quote: "การดึงข้อมูลจาก Google Sheets ทำให้ทีมแก้เมนูและ risk rules ได้เร็ว โดยไม่ต้อง deploy เว็บใหม่ทุกครั้ง"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5faf6] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-emerald-900/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
              <Leaf size={23} />
            </span>
            <span>
              <span className="block text-xl font-bold text-emerald-950">Baojai</span>
              <span className="hidden text-xs font-semibold text-emerald-700 sm:block">กินอย่างเข้าใจ ใส่ใจน้ำตาล</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 lg:flex">
            <div className="group relative">
              <button className="flex items-center gap-1 transition hover:text-emerald-700" type="button">
                Products
                <ChevronDown size={16} />
              </button>
              <div className="pointer-events-none absolute left-0 top-7 w-56 rounded-lg border border-emerald-900/10 bg-white p-2 opacity-0 shadow-2xl shadow-emerald-950/10 transition group-hover:pointer-events-auto group-hover:opacity-100">
                {productNav.map((item) => (
                  <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-800">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="#offerings" className="transition hover:text-emerald-700">
              Solutions
            </Link>
            <Link href="#database" className="transition hover:text-emerald-700">
              Data
            </Link>
            <Link href="#testimonials" className="transition hover:text-emerald-700">
              Stories
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link className="hidden rounded-lg px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 sm:inline-flex" href="/login">
              Login
            </Link>
            <details className="group relative lg:hidden">
              <summary className="focus-ring grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg border border-emerald-900/10 bg-white text-emerald-800 transition hover:border-emerald-700 [&::-webkit-details-marker]:hidden">
                <Menu size={20} />
                <span className="sr-only">เปิดเมนู</span>
              </summary>
              <div className="absolute right-0 top-12 w-[min(86vw,340px)] rounded-lg border border-emerald-900/10 bg-white p-3 shadow-2xl shadow-emerald-950/15">
                <nav className="grid gap-1">
                  {productNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-lg px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link className="rounded-lg px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800" href="#offerings">
                    Solutions
                  </Link>
                  <Link className="rounded-lg px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800" href="#database">
                    Data
                  </Link>
                  <Link className="rounded-lg px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800" href="#testimonials">
                    Stories
                  </Link>
                  <Link className="mt-2 rounded-lg bg-emerald-700 px-3 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-800" href="/login">
                    Login / ทดลองใช้งาน
                  </Link>
                </nav>
              </div>
            </details>
            <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800" href="/login">
              ทดลองใช้งาน
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-[540px] bg-gradient-to-b from-emerald-100 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold text-emerald-700">Your source for Thai wellness intelligence</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-emerald-950 sm:text-5xl lg:text-6xl">
              วิเคราะห์ฉลากอาหาร แผนมื้อ และระดับน้ำตาลในเว็บเดียว
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Baojai คือเว็บสุขภาพโทนเขียวสำหรับผู้ใช้ไทยที่ต้องการคุมอาหารและน้ำตาล พร้อม login, Vercel Postgres, audit log, Google Sheets source, meal plan และ chatbot ที่มีขอบเขตปลอดภัย
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white shadow-xl shadow-emerald-900/20 transition hover:bg-emerald-800" href="/login">
                Sign up Free
                <ArrowRight size={18} />
              </Link>
              <Link className="inline-flex h-12 items-center gap-2 rounded-lg border border-emerald-800/20 bg-white px-5 text-sm font-bold text-emerald-800 transition hover:border-emerald-700 hover:bg-emerald-50" href="#offerings">
                ดูฟังก์ชันทั้งหมด
                <Sparkles size={18} />
              </Link>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ["24g", "daily sugar limit"],
                ["3", "Google Sheet tabs"],
                ["7 วัน", "glucose trend"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-emerald-900/10 bg-white/76 p-4 shadow-lg shadow-emerald-900/5 backdrop-blur">
                  <p className="text-2xl font-bold text-emerald-800">{value}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[520px]">
            <div className="absolute inset-0 overflow-hidden rounded-lg border border-emerald-900/10 bg-emerald-950 shadow-2xl shadow-emerald-950/15">
              <Image src="/baojai-hero.png" alt="อาหารสุขภาพและอุปกรณ์ติดตามระดับน้ำตาล" fill className="object-cover opacity-70" priority sizes="(min-width: 1024px) 46vw, 100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent" />
            </div>

            <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/50 bg-white/88 p-4 shadow-2xl backdrop-blur sm:left-8 sm:right-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-emerald-700">Health Dashboard</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">วันนี้น้ำตาล 17g จาก 24g</h2>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Activity size={22} />
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Glucose", "126"],
                  ["Risk", "กลาง"],
                  ["Plan", "4 มื้อ"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-700">{label}</p>
                    <p className="mt-1 text-xl font-bold text-emerald-950">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-900/10 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-bold text-slate-500">ออกแบบสำหรับผู้ใช้ที่ต้องติดตามอาหาร น้ำตาล และเมนูรายวัน</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {trustItems.map((item) => (
              <div key={item} className="flex min-h-14 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-center text-xs font-bold text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="offerings" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center">
          <p className="text-sm font-bold text-emerald-700">Our Product Offerings</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">ฟังก์ชันหลักของ Baojai</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            อ้างอิง workflow จาก `skill.md`: วิเคราะห์ฉลาก แนะนำเมนู บันทึกอาหาร วิเคราะห์ glucose สร้าง meal plan chatbot และ Dashboard สุขภาพ
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {offeringCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link key={card.title} href={card.href} className="group rounded-lg border border-emerald-900/10 bg-white p-6 shadow-lg shadow-emerald-900/5 transition hover:-translate-y-1 hover:border-emerald-700 hover:shadow-2xl hover:shadow-emerald-900/10">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-700 group-hover:text-white">
                  <Icon size={24} />
                </span>
                <p className="mt-5 text-sm font-bold text-emerald-700">{card.title}</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-950">{card.subtitle}</h3>
                <p className="mt-3 min-h-20 text-sm leading-7 text-slate-600">{card.detail}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
                  Explore
                  <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:px-8">
          {featureRows.map((feature, index) => {
            const Icon = feature.icon;
            const reverse = index % 2 === 1;

            return (
              <article id={feature.id} key={feature.id} className={`grid gap-6 lg:grid-cols-2 lg:items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="rounded-lg border border-emerald-900/10 bg-[#f5faf6] p-6 sm:p-8">
                  <p className="text-sm font-bold text-emerald-700">{feature.eyebrow}</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-950">{feature.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{feature.intro}</p>
                  <ul className="mt-5 grid gap-3">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-sm leading-6 text-slate-700">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={18} />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-2xl shadow-emerald-900/10">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-700 text-white">
                        <Icon size={22} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-950">Baojai workspace</p>
                        <p className="text-xs font-semibold text-slate-500">{feature.eyebrow}</p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">Live</span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {feature.stats.map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-bold text-slate-500">{label}</p>
                        <p className="mt-2 text-2xl font-bold text-emerald-800">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-lg border border-emerald-900/10 bg-emerald-50 p-4">
                    <div className="h-3 rounded-full bg-white">
                      <div className="h-3 rounded-full bg-emerald-600" style={{ width: index === 0 ? "45%" : index === 1 ? "68%" : "82%" }} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-emerald-900">
                      {index === 0
                        ? "แสดง risk score และคำเตือนภาษาไทยทันทีหลังกรอกฉลาก"
                        : index === 1
                          ? "Dashboard สรุปน้ำตาล คาร์บ และแนวโน้มหลังอาหาร"
                          : "Meal plan สร้างจากเป้าหมายผู้ใช้และฐานข้อมูลเมนู"}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="database" className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-20">
        <div>
          <p className="text-sm font-bold text-emerald-700">Raw Food Database + Google Sheets</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">ให้ทีมแก้ข้อมูลอาหารได้เร็ว แล้ว sync เข้า database</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Baojai รองรับแหล่งข้อมูล `foods`, `menus`, และ `risk_rules` จาก Google Sheets ผ่าน service account แล้วบันทึก sync run และ audit log เพื่อใช้กับคำแนะนำเมนูและฉลากอาหาร
          </p>
          <div className="mt-6 grid gap-3">
            {workflowSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="flex gap-3 rounded-lg border border-emerald-900/10 bg-white p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="font-bold text-slate-950">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-emerald-900/10 bg-emerald-950 p-5 text-white shadow-2xl shadow-emerald-950/15">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-emerald-200">Sheet sync preview</p>
              <h3 className="mt-1 text-2xl font-bold">foods / menus / risk_rules</h3>
            </div>
            <Database size={28} className="text-emerald-200" />
          </div>
          <div className="mt-5 overflow-hidden rounded-lg border border-white/15 bg-white/10">
            {[
              ["foods!A:K", "128 rows", "น้ำตาลต่ำ, โปรตีนสูง"],
              ["menus!A:L", "42 rows", "breakfast, lunch, dinner"],
              ["risk_rules!A:G", "16 rows", "severity, message_th"]
            ].map(([range, rows, tags]) => (
              <div key={range} className="grid gap-2 border-b border-white/10 p-4 last:border-b-0 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-bold">{range}</p>
                  <p className="mt-1 text-sm text-emerald-100">{tags}</p>
                </div>
                <span className="self-start rounded-lg bg-white px-3 py-1 text-xs font-bold text-emerald-900">{rows}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-white p-4 text-slate-950">
            <p className="text-sm font-bold text-emerald-700">Vercel-ready backend</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ใช้ Neon Postgres, Drizzle schema, API route สำหรับ sync และ environment variables สำหรับ Google service account โดยไม่ส่ง credential ไป browser
            </p>
          </div>
        </div>
      </section>

      <section id="testimonials" className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold text-emerald-700">What users say</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">ออกแบบให้ทีมสุขภาพและผู้ใช้ทั่วไปอ่านเข้าใจ</h2>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote key={item.name} className="rounded-lg border border-emerald-900/10 bg-[#f5faf6] p-6">
                <MessageCircle className="text-emerald-700" size={24} />
                <p className="mt-4 text-sm leading-7 text-slate-700">“{item.quote}”</p>
                <footer className="mt-5 text-sm font-bold text-emerald-900">{item.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-emerald-900/10 bg-emerald-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-emerald-800">
                <Leaf size={22} />
              </span>
              <div>
                <p className="text-xl font-bold">Baojai</p>
                <p className="text-sm text-emerald-100">Thai-first wellness web app</p>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-100">
              Baojai ให้คำแนะนำด้านอาหารทั่วไป ไม่ใช่การวินิจฉัยโรคหรือคำสั่งรักษา หากมีอาการผิดปกติควรปรึกษาบุคลากรทางการแพทย์
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link className="rounded-lg border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10" href="/login">
              Login
            </Link>
            <Link className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50" href="/dashboard">
              Open Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

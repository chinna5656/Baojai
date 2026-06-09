import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowRight, Leaf, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { signInAction } from "@/app/login/actions";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen bg-[#f5faf6] lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex items-center px-5 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
              <Leaf size={26} />
            </span>
            <div>
              <p className="text-2xl font-bold text-emerald-950">Baojai</p>
              <p className="text-sm font-medium text-emerald-700">กินอย่างเข้าใจ ใส่ใจน้ำตาล</p>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-sm font-bold text-emerald-700">เข้าสู่ระบบสุขภาพส่วนตัว</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-950">ดูแลอาหารและน้ำตาลในที่เดียว</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Dashboard นี้ใช้ demo session เพื่อพรีวิว flow จริง เมื่อเชื่อม Auth และฐานข้อมูลแล้วข้อมูลจะถูกแยกตามผู้ใช้
            </p>
          </div>

          <form action={signInAction} className="baojai-card mt-8 rounded-lg p-5">
            <label className="block text-sm font-bold text-slate-800" htmlFor="email">
              อีเมล
            </label>
            <div className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-emerald-900/10 bg-white px-3">
              <Mail size={18} className="text-emerald-700" />
              <input
                id="email"
                name="email"
                className="focus-ring w-full bg-transparent text-sm outline-none"
                defaultValue="demo@baojai.app"
                type="email"
              />
            </div>

            <label className="mt-4 block text-sm font-bold text-slate-800" htmlFor="password">
              รหัสผ่าน
            </label>
            <div className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-emerald-900/10 bg-white px-3">
              <LockKeyhole size={18} className="text-emerald-700" />
              <input
                id="password"
                name="password"
                className="focus-ring w-full bg-transparent text-sm outline-none"
                defaultValue="baojai-demo"
                type="password"
              />
            </div>

            <button
              className="focus-ring mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800"
              type="submit"
            >
              เข้าสู่ Baojai
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-900/10 bg-white/70 p-4 text-sm leading-6 text-slate-600">
            <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={19} />
            <p>
              Baojai ให้คำแนะนำด้านอาหารทั่วไป ไม่ใช่การวินิจฉัยโรคหรือคำสั่งรักษา หากมีอาการผิดปกติควรปรึกษาบุคลากรทางการแพทย์
            </p>
          </div>
        </div>
      </section>

      <section className="relative hidden min-h-screen overflow-hidden lg:block">
        <Image
          src="/baojai-hero.png"
          alt="อาหารสุขภาพและอุปกรณ์ติดตามระดับน้ำตาล"
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5faf6] via-[#f5faf6]/22 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-md rounded-lg border border-white/60 bg-white/78 p-5 shadow-2xl backdrop-blur">
          <p className="text-sm font-bold text-emerald-800">พร้อมสำหรับ Vercel</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">Login, Postgres, Google Sheets และ AI workflows ในโครงเดียว</p>
        </div>
      </section>
    </main>
  );
}

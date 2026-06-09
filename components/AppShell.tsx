import Link from "next/link";
import { Leaf, LogOut, Menu, ShieldCheck } from "lucide-react";
import { signOutAction } from "@/app/login/actions";
import { navigationItems } from "@/lib/mock-data";
import type { SessionUser } from "@/lib/auth";

type AppShellProps = {
  active: string;
  user: SessionUser;
  children: React.ReactNode;
};

export function AppShell({ active, user, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-emerald-900/10 bg-white/88 px-5 py-6 shadow-[16px_0_40px_rgba(15,81,50,0.06)] backdrop-blur lg:flex">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-700 text-white">
            <Leaf size={23} />
          </span>
          <span>
            <span className="block text-xl font-bold text-emerald-950">Baojai</span>
            <span className="text-xs font-medium text-emerald-700">กินอย่างเข้าใจ ใส่ใจน้ำตาล</span>
          </span>
        </Link>

        <nav className="mt-8 grid gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === active;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-lg shadow-emerald-900/10"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-emerald-900/10 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 text-emerald-700" size={20} />
            <div>
              <p className="text-sm font-bold text-emerald-950">ข้อมูลสุขภาพเป็นส่วนตัว</p>
              <p className="mt-1 text-xs leading-5 text-emerald-800">
                ทุกหน้าดึงข้อมูลตาม session ผู้ใช้ และบันทึกเหตุการณ์สำคัญใน audit log
              </p>
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-emerald-900/10 bg-white/82 px-4 py-3 backdrop-blur lg:ml-72 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-700 text-white">
              <Leaf size={19} />
            </span>
            <span className="font-bold text-emerald-950">Baojai</span>
          </Link>

          <nav className="hidden flex-1 gap-2 overflow-x-auto lg:flex">
            {navigationItems.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${
                  item.id === active ? "bg-emerald-100 text-emerald-800" : "text-slate-500"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <details className="group relative lg:hidden">
              <summary className="focus-ring grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg border border-emerald-900/10 bg-white text-emerald-800 transition hover:border-emerald-700 [&::-webkit-details-marker]:hidden">
                <Menu size={20} />
                <span className="sr-only">เปิดเมนู</span>
              </summary>
              <div className="absolute right-0 top-12 w-[min(86vw,340px)] rounded-lg border border-emerald-900/10 bg-white p-3 shadow-2xl shadow-emerald-950/15">
                <nav className="grid gap-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.id === active;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition ${
                          isActive ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                        }`}
                      >
                        <Icon size={18} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </details>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.goal}</p>
            </div>
            <form action={signOutAction}>
              <button
                className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-emerald-900/10 bg-white text-slate-600 transition hover:border-emerald-700 hover:text-emerald-700"
                title="ออกจากระบบ"
                type="submit"
              >
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>

      </header>

      <main className="px-4 py-6 lg:ml-72 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}

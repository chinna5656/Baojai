import Link from "next/link";
import { 
  User, Mail, LockKeyhole, Activity, 
  ChevronDown, ArrowRight, ShieldAlert 
} from "lucide-react";
import { registerAction } from "./actions";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f7f3] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl rounded-2xl bg-white/80 p-8 shadow-xl shadow-emerald-950/5 backdrop-blur-md border border-white">
        
        {/* Header ส่วนหัวฟอร์ม */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-emerald-950">📝 ข้อมูลสุขภาพเบื้องต้น</h2>
          <p className="mt-2 text-sm text-slate-500">กรอกข้อมูลเพื่อประสิทธิภาพสูงสุดในการแนะนำเมนูอาหาร</p>
        </div>

        {/* ฟอร์มลงทะเบียนส่งค่าไปยัง Server Action */}
        <form action={registerAction} className="space-y-6">
          
          {/* จัด Grid แบ่งเป็น 2 คอลัมน์ซ้าย-ขวา บนจอใหญ่ */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            
            {/* ฝั่งซ้าย: ชื่อของคุณ */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="name">ชื่อของคุณ</label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition">
                <User size={18} className="text-emerald-600" />
                <input id="name" name="name" type="text" placeholder="คุณใจดี" className="w-full bg-transparent text-sm outline-none" required />
              </div>
            </div>

            {/* ฝั่งขวา: อีเมล */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="email">อีเมล</label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition">
                <Mail size={18} className="text-emerald-600" />
                <input id="email" name="email" type="email" placeholder="your.email@example.com" className="w-full bg-transparent text-sm outline-none" required />
              </div>
            </div>

            {/* ฝั่งซ้าย: รหัสผ่าน */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="password">รหัสผ่าน</label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition">
                <LockKeyhole size={18} className="text-emerald-600" />
                <input id="password" name="password" type="password" placeholder="••••••••" className="w-full bg-transparent text-sm outline-none" required />
              </div>
            </div>

            {/* ฝั่งขวา: ประเภทเบาหวาน */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="diabetesType">ประเภทเบาหวาน</label>
              <div className="relative flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 transition">
                <Activity size={18} className="text-emerald-600" />
                <select id="diabetesType" name="diabetesType" className="w-full appearance-none bg-transparent text-sm outline-none pr-8 cursor-pointer text-slate-800">
                  <option value="type2">เบาหวานชนิดที่ 2 (ดื้ออินซูลิน)</option>
                  <option value="type1">เบาหวานชนิดที่ 1 (ขาดอินซูลิน)</option>
                  <option value="pre-diabetes">เสี่ยงเบาหวาน (Pre-diabetes)</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* ฝั่งซ้าย: อายุ */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="age">อายุ (ปี)</label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 transition">
                <input id="age" name="age" type="number" placeholder="30" min="1" className="w-full bg-transparent text-sm outline-none" required />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="sex">เพศ</label>
              <div className="relative flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 transition">
                <User size={18} className="text-emerald-600" />
                <select id="sex" name="sex" className="w-full appearance-none bg-transparent pr-8 text-sm text-slate-800 outline-none cursor-pointer">
                  <option value="">เลือกเพศ</option>
                  <option value="female">หญิง</option>
                  <option value="male">ชาย</option>
                  <option value="other">อื่นๆ</option>
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 text-slate-400" />
              </div>
            </div>

            {/* ฝั่งขวา: ส่วนสูง */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="height">ส่วนสูง (ซม.)</label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 transition">
                <input id="height" name="height" type="number" placeholder="170" min="1" className="w-full bg-transparent text-sm outline-none" required />
              </div>
            </div>

            {/* ฝั่งซ้าย: น้ำหนัก */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="weight">น้ำหนัก (กก.)</label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 transition">
                <input id="weight" name="weight" type="number" step="0.1" placeholder="70.0" min="1" className="w-full bg-transparent text-sm outline-none" required />
              </div>
            </div>

            {/* ฝั่งขวา: เป้าหมายน้ำตาล */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="sugarTarget">เป้าหมายน้ำตาลหลังอาหาร (mg/dL)</label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 transition">
                <input id="sugarTarget" name="sugarTarget" type="number" defaultValue="140" className="w-full bg-transparent text-sm font-medium text-emerald-700 outline-none" required />
              </div>
            </div>

          </div>

          {/* แถวยาวเต็มหน้าจอ: อาหารที่แพ้ */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="allergies">อาหารที่แพ้ / ข้อจำกัด (ถ้ามี)</label>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 transition">
              <ShieldAlert size={18} className="text-amber-500" />
              <input id="allergies" name="allergies" type="text" placeholder="เช่น กุ้ง, นมวัว, ถั่ว (คั่นด้วยเครื่องหมายจุลภาค)" className="w-full bg-transparent text-sm outline-none" />
            </div>
          </div>

          {/* ปุ่มส่งข้อมูลดีไซน์พรีเมียมสีเขียวไล่เฉด */}
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 text-base font-bold text-white shadow-lg shadow-emerald-800/20 transition duration-200 hover:opacity-95 hover:shadow-xl active:scale-[0.99]"
          >
            สมัครสมาชิกเข้าสู่ระบบ
            <ArrowRight size={18} />
          </button>
        </form>

        {/* ฟุตเตอร์เปลี่ยนหน้า */}
        <div className="mt-6 text-center text-sm text-slate-500">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition">
            เข้าสู่ระบบที่นี่
          </Link>
        </div>

      </div>
    </div>
  );
}

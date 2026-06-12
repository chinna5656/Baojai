import Link from "next/link";
import { Edit3, RotateCcw, Save } from "lucide-react";
import { updateSettingsAction } from "./actions";

type SettingsProfileFormProps = {
  activityLevel: string;
  ageRange: string;
  allergyText: string;
  dailyCarbTargetG: number;
  dailySugarLimitG: number;
  dietaryStyle: string;
  displayName: string;
  email: string;
  glucoseTargetMax: number;
  glucoseTargetMin: number;
  healthGoal: string;
  heightCm: number | null;
  isEditing: boolean;
  medicalDisclaimerAccepted: boolean;
  sex: string;
  sodiumLimitMg: number;
  weightKg: number | null;
};

const ageOptions = [
  ["", "ไม่ระบุ"],
  ["under_18", "ต่ำกว่า 18 ปี"],
  ["18_29", "18-29 ปี"],
  ["30_44", "30-44 ปี"],
  ["45_59", "45-59 ปี"],
  ["60_plus", "60 ปีขึ้นไป"]
];

const glucoseMinOptions = [70, 80, 90, 100, 110, 120];
const glucoseMaxOptions = [120, 130, 140, 160, 180, 200];

function fieldClass(isEditing: boolean) {
  return `mt-2 h-11 w-full rounded-lg border px-3 text-sm outline-none transition ${
    isEditing ? "focus-ring border-emerald-900/10 bg-white focus:border-emerald-500" : "border-slate-200 bg-slate-50 text-slate-600"
  }`;
}

function ProfileField({
  children,
  className = "",
  label
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={`text-sm font-bold text-slate-700 ${className}`}>
      {label}
      {children}
    </label>
  );
}

export function SettingsProfileForm(props: SettingsProfileFormProps) {
  return (
    <form action={updateSettingsAction} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-900/10 bg-white p-3">
        <div>
          <p className="text-sm font-bold text-slate-950">สถานะแบบฟอร์ม</p>
          <p className="text-sm text-slate-500">
            {props.isEditing ? "กำลังแก้ไขข้อมูล กดบันทึกเมื่อเสร็จ" : "ข้อมูลถูกล็อกอยู่ กดแก้ไขข้อมูลก่อนเปลี่ยนข้อมูล"}
          </p>
        </div>
        <div className="flex gap-2">
          {!props.isEditing ? (
            <Link
              className="focus-ring flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800"
              href="/settings?mode=edit"
            >
              <Edit3 size={16} />
              แก้ไขข้อมูล
            </Link>
          ) : (
            <>
              <Link
                className="focus-ring flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                href="/settings"
              >
                <RotateCcw size={16} />
                ยกเลิก
              </Link>
              <button
                className="focus-ring flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800"
                type="submit"
              >
                <Save size={16} />
                บันทึก
              </button>
            </>
          )}
        </div>
      </div>

      <fieldset disabled={!props.isEditing} className="space-y-5 disabled:opacity-95">
        <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
          <section className="baojai-card rounded-lg p-5">
            <h2 className="text-xl font-bold text-slate-950">1. ข้อมูลส่วนตัว</h2>
            <p className="mt-1 text-sm text-slate-500">ข้อมูลพื้นฐานที่ใช้แสดงผลและปรับคำแนะนำ</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ProfileField label="ชื่อที่แสดง">
                <input className={fieldClass(props.isEditing)} defaultValue={props.displayName} maxLength={80} name="displayName" required />
              </ProfileField>
              <ProfileField label="อีเมล">
                <input className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500" defaultValue={props.email} disabled />
              </ProfileField>
              <ProfileField label="เพศ">
                <select className={fieldClass(props.isEditing)} defaultValue={props.sex} name="sex">
                  <option value="">ไม่ระบุ</option>
                  <option value="female">หญิง</option>
                  <option value="male">ชาย</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </ProfileField>
              <ProfileField label="ช่วงอายุ">
                <select className={fieldClass(props.isEditing)} defaultValue={props.ageRange} name="ageRange">
                  {ageOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </ProfileField>
              <ProfileField label="ส่วนสูง (cm)">
                <input className={fieldClass(props.isEditing)} defaultValue={props.heightCm ?? ""} max={250} min={80} name="heightCm" type="number" />
              </ProfileField>
              <ProfileField label="น้ำหนัก (kg)">
                <input className={fieldClass(props.isEditing)} defaultValue={props.weightKg ?? ""} max={300} min={20} name="weightKg" step="0.1" type="number" />
              </ProfileField>
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <h2 className="text-xl font-bold text-slate-950">2. บริบทสุขภาพ</h2>
            <p className="mt-1 text-sm text-slate-500">ใช้เป็นข้อมูลประกอบ ไม่ใช่คำวินิจฉัย</p>
            <div className="mt-5 grid gap-4">
              <ProfileField label="ประเภทโรคเบาหวาน">
                <select id="diabetesType" name="activityLevel" defaultValue={props.activityLevel || "type2"}
                  disabled={!props.isEditing}
                  className={`w-full h-11 px-3 pr-10 text-sm font-medium rounded-lg border outline-none appearance-none transition-all duration-200 cursor-pointer ${
                  props.isEditing
                  ? "bg-white border-emerald-900/10 text-slate-950 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  : "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
                  }`}>
                  <option value="type2">เบาหวานชนิดที่ 2 (ดื้ออินซูลิน)</option>
                  <option value="type1">เบาหวานชนิดที่ 1 (ขาดอินซูลิน)</option>
                  <option value="pre-diabetes">เสี่ยงเบาหวาน (Pre-diabetes)</option>
                </select>
              </ProfileField>
              <ProfileField label="เป้าหมายสุขภาพ">
                <input className={fieldClass(props.isEditing)} defaultValue={props.healthGoal} maxLength={100} name="healthGoal" placeholder="เช่น คุมระดับน้ำตาล" />
              </ProfileField>
              <label className="flex items-start gap-3 rounded-lg border border-emerald-900/10 bg-white p-3 text-sm leading-6 text-slate-700">
                <input className="mt-1 h-4 w-4 accent-emerald-700" defaultChecked={props.medicalDisclaimerAccepted} name="medicalDisclaimerAccepted" type="checkbox" />
                <span>ยอมรับว่าข้อมูลในระบบเป็นข้อมูลประกอบการดูแลสุขภาพ ไม่ใช่คำวินิจฉัยหรือคำสั่งรักษา</span>
              </label>
            </div>
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="baojai-card rounded-lg p-5">
            <h2 className="text-xl font-bold text-slate-950">3. รูปแบบอาหาร</h2>
            <p className="mt-1 text-sm text-slate-500">ใช้ช่วยจัด meal plan และคำแนะนำอาหาร</p>
            <div className="mt-5 grid gap-4">
              <ProfileField label="รูปแบบอาหาร">
                <select className={fieldClass(props.isEditing)} defaultValue={props.dietaryStyle} name="dietaryStyle">
                  <option value="">ไม่ระบุ</option>
                  <option value="thai_balanced">อาหารไทยสมดุล</option>
                  <option value="lower_carb">คาร์บต่ำ</option>
                  <option value="high_protein">โปรตีนสูง</option>
                  <option value="vegetarian">มังสวิรัติ</option>
                </select>
              </ProfileField>
              <ProfileField label="อาหารที่แพ้หรือควรเลี่ยง">
                <input className={fieldClass(props.isEditing)} defaultValue={props.allergyText} maxLength={600} name="allergies" placeholder="เช่น ถั่วลิสง, กุ้ง, นม" />
              </ProfileField>
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <h2 className="text-xl font-bold text-slate-950">4. เป้าหมายตัวเลข</h2>
            <p className="mt-1 text-sm text-slate-500">ค่า glucose ใช้ select เพื่อป้องกันข้อมูลผิดรูปแบบ</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ProfileField label="น้ำตาลต่อวัน (g)">
                <input className={fieldClass(props.isEditing)} defaultValue={props.dailySugarLimitG} max={150} min={1} name="dailySugarLimitG" type="number" />
              </ProfileField>
              <ProfileField label="คาร์บต่อวัน (g)">
                <input className={fieldClass(props.isEditing)} defaultValue={props.dailyCarbTargetG} max={500} min={1} name="dailyCarbTargetG" type="number" />
              </ProfileField>
              <ProfileField label="โซเดียมต่อวัน (mg)">
                <input className={fieldClass(props.isEditing)} defaultValue={props.sodiumLimitMg} max={10000} min={100} name="sodiumLimitMg" type="number" />
              </ProfileField>
              <ProfileField label="Glucose ต่ำสุด">
                <select className={fieldClass(props.isEditing)} defaultValue={props.glucoseTargetMin} name="glucoseTargetMin">
                  {glucoseMinOptions.map((value) => (
                    <option key={value} value={value}>
                      {value} mg/dL
                    </option>
                  ))}
                </select>
              </ProfileField>
              <ProfileField label="Glucose สูงสุด">
                <select className={fieldClass(props.isEditing)} defaultValue={props.glucoseTargetMax} name="glucoseTargetMax">
                  {glucoseMaxOptions.map((value) => (
                    <option key={value} value={value}>
                      {value} mg/dL
                    </option>
                  ))}
                </select>
              </ProfileField>
            </div>
          </section>
        </div>
      </fieldset>
    </form>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ScanLine } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { analyzeNutritionLabel, type NutritionInput } from "@/lib/nutrition";

const initialInput: Required<Pick<NutritionInput, "name" | "calories" | "carbG" | "sugarG" | "proteinG" | "fatG" | "saturatedFatG" | "sodiumMg" | "ingredients">> = {
  name: "ชานมหวานน้อย 1 แก้ว",
  calories: 320,
  carbG: 52,
  sugarG: 18,
  proteinG: 4,
  fatG: 6,
  saturatedFatG: 3,
  sodiumMg: 220,
  ingredients: "ชา นมผง น้ำตาล ครีมเทียม"
};

type InputKey = keyof typeof initialInput;

export function LabelAnalyzer() {
  const [form, setForm] = useState(initialInput);
  const [submitted, setSubmitted] = useState(initialInput);

  const analysis = useMemo(() => analyzeNutritionLabel(submitted), [submitted]);

  function updateField(key: InputKey, value: string) {
    setForm((current) => ({
      ...current,
      [key]: key === "name" || key === "ingredients" ? value : Number(value)
    }));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <form
        className="baojai-card rounded-lg p-5"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(form);
        }}
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
            <ScanLine size={20} />
          </span>
          <div>
            <p className="font-bold text-slate-950">กรอกข้อมูลจากฉลาก</p>
            <p className="text-sm text-slate-500">ระบบจะประเมินน้ำตาล โซเดียม คาร์บ และสารก่อแพ้</p>
          </div>
        </div>

        <label className="mt-5 block text-sm font-bold text-slate-700" htmlFor="label-name">
          ชื่ออาหารหรือเครื่องดื่ม
        </label>
        <input
          id="label-name"
          className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["calories", "พลังงาน kcal"],
            ["carbG", "คาร์บ g"],
            ["sugarG", "น้ำตาล g"],
            ["proteinG", "โปรตีน g"],
            ["fatG", "ไขมัน g"],
            ["saturatedFatG", "ไขมันอิ่มตัว g"],
            ["sodiumMg", "โซเดียม mg"]
          ].map(([key, label]) => (
            <label key={key} className="text-sm font-bold text-slate-700">
              {label}
              <input
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm"
                min="0"
                type="number"
                value={String(form[key as InputKey])}
                onChange={(event) => updateField(key as InputKey, event.target.value)}
              />
            </label>
          ))}
        </div>

        <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="ingredients">
          ส่วนประกอบ / สารก่อแพ้
        </label>
        <textarea
          id="ingredients"
          className="focus-ring mt-2 min-h-24 w-full rounded-lg border border-emerald-900/10 bg-white px-3 py-3 text-sm"
          value={form.ingredients}
          onChange={(event) => updateField("ingredients", event.target.value)}
        />

        <button className="focus-ring mt-5 h-11 w-full rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800" type="submit">
          วิเคราะห์ฉลาก
        </button>
      </form>

      <section className="baojai-card rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-emerald-700">ผลวิเคราะห์</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">{submitted.name}</h2>
          </div>
          <RiskBadge level={analysis.riskLevel} />
        </div>

        <div className="mt-5 rounded-lg border border-emerald-900/10 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-slate-600">Risk score</span>
            <span className="text-3xl font-bold text-emerald-800">{analysis.score}</span>
          </div>
          <div className="mt-3 h-3 rounded-full bg-slate-100">
            <div
              className={`h-3 rounded-full ${analysis.riskLevel === "high" ? "bg-rose-500" : analysis.riskLevel === "medium" ? "bg-amber-500" : "bg-emerald-600"}`}
              style={{ width: `${Math.max(8, analysis.score)}%` }}
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{analysis.summary}</p>
        </div>

        <div className="mt-5 grid gap-3">
          {analysis.warnings.length === 0 ? (
            <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 text-emerald-700" size={20} />
              <p className="text-sm font-semibold leading-6 text-emerald-900">ไม่พบคำเตือนสำคัญจากข้อมูลที่กรอก</p>
            </div>
          ) : (
            analysis.warnings.map((warning) => (
              <div key={warning.title} className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20} />
                <div>
                  <p className="font-bold text-amber-950">{warning.title}</p>
                  <p className="mt-1 text-sm leading-6 text-amber-900">{warning.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-900">คำแนะนำ</p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
            {analysis.recommendations.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

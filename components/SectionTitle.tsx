export function SectionTitle({
  eyebrow,
  title,
  detail
}: {
  eyebrow?: string;
  title: string;
  detail?: string;
}) {
  return (
    <div>
      {eyebrow ? <p className="text-xs font-bold uppercase text-emerald-700">{eyebrow}</p> : null}
      <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{title}</h1>
      {detail ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{detail}</p> : null}
    </div>
  );
}

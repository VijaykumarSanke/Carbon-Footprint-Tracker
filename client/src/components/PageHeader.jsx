export default function PageHeader({ eyebrow, title, description, extra }) {
  return (
    <section className="glass-panel overflow-hidden p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-500/70 dark:text-emerald-300/60">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-300">{description}</p>
        </div>
        {extra ? <div className="shrink-0">{extra}</div> : null}
      </div>
    </section>
  );
}

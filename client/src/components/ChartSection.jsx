import ChartsPanel from "./ChartsPanel";

export default function ChartSection({ categoryTotals, weeklyTrend }) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-600">Analytics</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
          Emission trends and breakdown
        </h2>
      </div>
      <ChartsPanel categoryTotals={categoryTotals} weeklyTrend={weeklyTrend} />
    </section>
  );
}

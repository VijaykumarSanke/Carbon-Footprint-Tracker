export default function ScoreCard({ score, level }) {
  return (
    <div className="glass-panel p-6 transition duration-300 hover:-translate-y-1">
      <p className="text-sm uppercase tracking-[0.3em] text-emerald-500/70 dark:text-emerald-300/60">
        Carbon Score
      </p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-5xl font-semibold text-slate-900 dark:text-white">{score}</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Premium behavior score based on your logged emissions.
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-200">
          {level}
        </span>
      </div>
    </div>
  );
}

export default function ProgressBar({ value, label }) {
  const safeValue = Math.max(0, Math.min(100, value || 0));

  return (
    <div>
      {label ? (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-300">{label}</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-300">{safeValue}%</span>
        </div>
      ) : null}
      <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-950/10 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

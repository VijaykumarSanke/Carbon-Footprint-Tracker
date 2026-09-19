export default function BadgeCard({ badge }) {
  const descriptions = {
    "Green Starter": "Unlocked by logging your first activity.",
    "Consistent Tracker": "Unlocked after building a steady tracking habit.",
    "Low Carbon Day": "Unlocked when a day stays under the low-carbon threshold.",
  };

  return (
    <div className="rounded-3xl border border-emerald-500/15 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 dark:bg-white/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{badge.badgeName}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {descriptions[badge.badgeName] || "Achievement unlocked in your carbon journey."}
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200">
          Badge
        </span>
      </div>
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
        Achieved {new Date(badge.achievedAt).toLocaleDateString()}
      </p>
    </div>
  );
}

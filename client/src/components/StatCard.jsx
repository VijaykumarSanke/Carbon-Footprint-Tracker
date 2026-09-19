export default function StatCard({ label, value, hint, accent = "emerald", icon }) {
  const accentClasses = {
    emerald: "from-emerald-500 to-lime-400",
    slate: "from-slate-800 to-slate-600",
    lime: "from-lime-400 to-emerald-500",
  };

  return (
    <div className="group rounded-[2rem] border border-emerald-500/10 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-[#101915]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accentClasses[accent] || accentClasses.emerald} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{hint}</p>
    </div>
  );
}

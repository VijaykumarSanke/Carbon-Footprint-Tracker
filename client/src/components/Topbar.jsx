import { Bell, Search } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";

export default function Topbar({ title, subtitle }) {
  return (
    <header className="relative z-50 overflow-visible flex flex-col gap-4 rounded-[2rem] border border-emerald-500/10 bg-white/80 px-5 py-5 shadow-sm backdrop-blur-xl dark:bg-[#101915]/70 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-600">{title}</p>
        {subtitle ? <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{subtitle}</h1> : null}
      </div>

      <div className="relative z-50 flex flex-col gap-3 overflow-visible sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/10 bg-[#f8fcf8] px-4 py-3 dark:bg-white/5">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            placeholder="Search emissions, activities, or goals..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 sm:w-72"
          />
        </div>

        <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/10 bg-[#f8fcf8] dark:bg-white/5">
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-200" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </button>

        <ProfileDropdown />
      </div>
    </header>
  );
}

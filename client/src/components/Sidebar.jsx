import {
  BarChart3,
  Goal,
  History,
  LayoutDashboard,
  Leaf,
  Menu,
  ScanSearch,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Analyze", to: "/analyze", icon: ScanSearch },
  { label: "Goals", to: "/goals", icon: Goal },
  { label: "History", to: "/history", icon: History },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function NavContent() {
    return (
      <div className="flex h-full flex-col">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 rounded-3xl px-3 py-3 text-left transition hover:bg-emerald-500/10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 text-white shadow-lg">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">EcoTrack AI</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Carbon intelligence</p>
          </div>
        </button>

        <div className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;

            return (
              <button
                key={item.to}
                onClick={() => {
                  navigate(item.to);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-auto rounded-[1.75rem] bg-gradient-to-br from-lime-200 via-emerald-100 to-emerald-200 p-5 text-slate-900 shadow-inner dark:from-emerald-500/20 dark:via-emerald-500/10 dark:to-lime-400/20 dark:text-white">
          <p className="text-sm font-medium">Did you know?</p>
          <p className="mt-3 text-base font-semibold">
            Shifting one weekly car trip to transit can save meaningful CO2 over a month.
          </p>
          <button
            onClick={() => {
              navigate("/analyze");
              setOpen(false);
            }}
            className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            Explore ideas
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/15 bg-white text-slate-900 shadow-lg lg:hidden dark:bg-slate-900 dark:text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="hidden w-80 shrink-0 border-r border-emerald-500/10 bg-[#f6fbf6]/80 p-5 backdrop-blur-xl lg:block dark:bg-[#07110b]/80">
        <NavContent />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 border-r border-emerald-500/10 bg-[#f6fbf6] p-5 shadow-2xl dark:bg-[#07110b]">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/10 bg-white dark:bg-white/5"
              >
                <X className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </button>
            </div>
            <NavContent />
          </div>
        </div>
      ) : null}
    </>
  );
}

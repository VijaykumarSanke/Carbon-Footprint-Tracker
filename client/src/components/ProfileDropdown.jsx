import { LogOut, MoonStar, SunMedium, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function ProfileDropdown() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative z-[60]" ref={ref}>
      <button
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-3 rounded-2xl border border-emerald-500/15 bg-white px-3 py-2 shadow-sm transition hover:border-emerald-500/30 dark:bg-white/5"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 text-sm font-semibold text-white">
          {user?.name?.slice(0, 1)?.toUpperCase() || "E"}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || "Eco User"}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Workspace</p>
        </div>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[70] w-64 rounded-3xl border border-emerald-500/15 bg-white p-3 shadow-2xl ring-1 ring-black/5 dark:bg-[#101915]">
          <div className="flex items-center gap-3 rounded-2xl px-3 py-3">
            <UserCircle2 className="h-10 w-10 text-emerald-500" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="mt-2 border-t border-emerald-500/10 pt-2">
            <button
              onClick={() => {
                toggleTheme();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-emerald-500/10 dark:text-slate-200"
            >
              {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              Toggle Theme ({isDark ? "Dark" : "Light"})
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-red-500 transition hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

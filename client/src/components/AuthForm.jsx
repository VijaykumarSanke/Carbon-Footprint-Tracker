import { useState } from "react";

export default function AuthForm({ mode, onSubmit, loading }) {
  const isSignup = mode === "signup";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
      className="glass-panel w-full max-w-md space-y-5 p-8"
    >
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-500/70 dark:text-emerald-300/60">
          {isSignup ? "Create Account" : "Welcome Back"}
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
          {isSignup ? "Start tracking smarter" : "Sign in to EcoTrack AI"}
        </h2>
      </div>

      {isSignup ? (
        <input
          required
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          className="w-full rounded-2xl border border-emerald-500/15 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 dark:bg-white/5 dark:text-white"
          placeholder="Full name"
        />
      ) : null}

      <input
        required
        type="email"
        value={form.email}
        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        className="w-full rounded-2xl border border-emerald-500/15 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 dark:bg-white/5 dark:text-white"
        placeholder="Email"
      />

      <input
        required
        type="password"
        value={form.password}
        onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
        className="w-full rounded-2xl border border-emerald-500/15 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 dark:bg-white/5 dark:text-white"
        placeholder="Password"
      />

      <button
        disabled={loading}
        className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Please wait..." : isSignup ? "Create account" : "Login"}
      </button>
    </form>
  );
}

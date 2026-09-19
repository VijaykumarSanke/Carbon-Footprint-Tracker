import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";

export default function GoalsPage() {
  const { goal, autoGoals, saveGoal, error } = useAppData();
  const [title, setTitle] = useState(goal?.title || "");
  const [type, setType] = useState(goal?.type || "");
  const [target, setTarget] = useState(goal?.target || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setTitle(goal?.title || "");
    setType(goal?.type || "");
    setTarget(goal?.target || "");
  }, [goal?.title, goal?.type, goal?.target]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setLocalError("");

    try {
      if (!title.trim()) {
        throw new Error("Enter a goal title.");
      }

      if (!type) {
        throw new Error("Select a goal type.");
      }

      if (!target) {
        throw new Error("Enter a target value.");
      }

      await saveGoal({
        title: title.trim(),
        type,
        target: Number(target),
      });
      setMessage("Emission target saved successfully.");
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const progress = goal?.progress || 0;

  return (
    <AppShell title="Goals" subtitle="Reduction targets">
      <div className="space-y-6 pb-10">
        <PageHeader
          eyebrow="Goals"
          title="Track your reduction target"
          description="Set a target total emission level and monitor how far your current footprint has moved from the baseline."
        />

        {error ? <Banner text={error} tone="error" /> : null}
        {localError ? <Banner text={localError} tone="error" /> : null}
        {message ? <Banner text={message} tone="success" /> : null}

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Set target</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-2xl border border-emerald-500/15 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 dark:bg-white/5 dark:text-white"
                placeholder="Goal title (e.g., Reduce AC usage)"
                required
              />
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="w-full rounded-2xl border border-emerald-500/15 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 dark:bg-white/5 dark:text-white"
                required
              >
                <option value="">Select type</option>
                <option value="energy">Energy</option>
                <option value="transport">Transport</option>
                <option value="food">Food</option>
              </select>
              <input
                type="number"
                min="1"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                className="w-full rounded-2xl border border-emerald-500/15 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 dark:bg-white/5 dark:text-white"
                placeholder="Example: 120"
                required
              />
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Set the goal title, choose the matching category, and enter a target emission value in kilograms of CO2e.
              </p>
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-400 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Goal"}
              </button>
            </form>
          </div>

          <div className="glass-panel p-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Progress</h2>
            {goal ? (
              <div className="mt-6 space-y-4">
                <GoalMetric label="Goal title" value={goal.title || "Emission target"} />
                <GoalMetric label="Goal type" value={goal.type || "general"} />
                <GoalMetric label="Baseline emission" value={`${goal.baselineEmission} kg`} />
                <GoalMetric label="Current emission" value={`${goal.currentEmission} kg`} />
                <GoalMetric label="Target emission" value={`${goal.target} kg`} />
                <div className="rounded-3xl bg-emerald-50 p-5 dark:bg-white/5">
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-white dark:bg-white/10">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-emerald-500/20 px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                No target set yet.
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Added recommendation goals</h2>
          <div className="mt-6 space-y-4">
            {autoGoals.length ? (
              autoGoals.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-emerald-500/10 bg-white/70 p-5 dark:bg-white/5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-medium text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Added on {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                        {item.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-white/10 dark:text-slate-200">
                        {item.progress}% progress
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>{item.type} goal</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-emerald-100 dark:bg-white/10">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-emerald-500/20 px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                No recommendation goals added yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function GoalMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-emerald-500/10 bg-white/70 px-4 py-4 dark:bg-white/5">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function Banner({ text, tone }) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 text-sm ${
        tone === "error"
          ? "bg-red-500/10 text-red-600 dark:text-red-200"
          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
      }`}
    >
      {text}
    </div>
  );
}

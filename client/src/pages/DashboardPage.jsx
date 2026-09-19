import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const chartColors = ["#16a34a", "#f59e0b", "#0ea5e9"];

export default function DashboardPage() {
  const { dashboard, loading, error } = useAppData();

  const pieData = Object.entries(dashboard.categoryBreakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <AppShell title="Dashboard" subtitle="Carbon footprint overview">
      <div className="space-y-6 pb-10">
        <PageHeader
          eyebrow="Overview"
          title="Live carbon dashboard"
          description="Track total emissions, score, category mix, weekly trend, and your latest activities in one place."
        />

        {error ? <Banner tone="error" text={error} /> : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Emissions" value={`${dashboard.totalEmission} kg`} hint="All logged activities" />
          <MetricCard label="Carbon Score" value={dashboard.carbonScore} hint="Updates dynamically" />
          <MetricCard
            label="Reduction Target"
            value={dashboard.goal ? `${dashboard.goal.target} kg` : "Not set"}
            hint={dashboard.goal ? `${dashboard.goal.progress}% complete` : "Create a goal in Goals"}
          />
          <MetricCard
            label="Recent Activities"
            value={dashboard.recentActivities?.length || 0}
            hint="Latest 5 entries"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-emerald-600">Weekly trend</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  Emissions over time
                </h2>
              </div>
              <ScorePill score={dashboard.carbonScore} />
            </div>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboard.weeklyTrend || []}>
                  <Tooltip />
                  <Line type="monotone" dataKey="emission" stroke="#16a34a" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-600">Category split</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Where emissions come from
            </h2>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={65} outerRadius={100}>
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-600">Goal progress</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Emission reduction target
            </h2>
            {dashboard.goal ? (
              <div className="mt-6 space-y-4">
                <ProgressRow label="Baseline" value={`${dashboard.goal.baselineEmission} kg`} />
                <ProgressRow label="Current" value={`${dashboard.goal.currentEmission} kg`} />
                <ProgressRow label="Target" value={`${dashboard.goal.target} kg`} />
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>Completion</span>
                    <span>{dashboard.goal.progress}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-emerald-100 dark:bg-white/10">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-500"
                      style={{ width: `${dashboard.goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState text="Set a target to start tracking progress here." />
            )}
          </div>

          <div className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-600">Recent activities</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Latest logged behavior
            </h2>
            <div className="mt-6 space-y-4">
              {(dashboard.recentActivities || []).length ? (
                dashboard.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-3xl border border-emerald-500/10 bg-white/70 p-4 dark:bg-white/5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-medium text-slate-900 dark:text-white">
                        {activity.description}
                      </p>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-700 dark:text-emerald-200">
                        {activity.category}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <span>{new Date(activity.date).toLocaleString()}</span>
                      <span>{activity.emission} kg CO2e</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{activity.insights}</p>
                  </div>
                ))
              ) : (
                <EmptyState text={loading ? "Loading your activity feed..." : "No activities logged yet."} />
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function MetricCard({ label, value, hint }) {
  return (
    <div className="glass-panel p-5">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{hint}</p>
    </div>
  );
}

function ProgressRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-sm dark:bg-white/5">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <span className="font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function ScorePill({ score }) {
  return (
    <div className="rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-2 text-sm font-semibold text-white">
      Score {score}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-emerald-500/20 px-4 py-10 text-center text-slate-500 dark:text-slate-400">
      {text}
    </div>
  );
}

function Banner({ tone, text }) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 text-sm ${
        tone === "error" ? "bg-red-500/10 text-red-600 dark:text-red-200" : "bg-emerald-500/10 text-emerald-700"
      }`}
    >
      {text}
    </div>
  );
}

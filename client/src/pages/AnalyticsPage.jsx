import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const chartColors = ["#16a34a", "#f59e0b", "#0ea5e9"];

export default function AnalyticsPage() {
  const { analytics, error } = useAppData();

  return (
    <AppShell title="Analytics" subtitle="Deeper carbon insights">
      <div className="space-y-6 pb-10">
        <PageHeader
          eyebrow="Reports"
          title="Carbon analytics"
          description="Review category split, weekly emissions, daily activity counts, insight trends, and a monthly forecast based on average daily behavior."
        />

        {error ? (
          <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Category split">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.pieChart} dataKey="value" outerRadius={100} innerRadius={55}>
                  {(analytics.pieChart || []).map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Weekly emissions">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.weeklyEmissions}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="emission" stroke="#16a34a" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <ChartCard title="Daily activity count">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-600">Insights & forecast</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              What the numbers are saying
            </h2>
            <div className="mt-6 space-y-4">
              {(analytics.insights || []).map((insight) => (
                <div
                  key={insight}
                  className="rounded-3xl border border-emerald-500/10 bg-white/70 p-4 text-slate-700 dark:bg-white/5 dark:text-slate-200"
                >
                  {insight}
                </div>
              ))}
              <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-lime-400 p-5 text-white">
                <p className="text-sm uppercase tracking-[0.2em] text-white/80">Prediction</p>
                <p className="mt-3 text-3xl font-semibold">{analytics.prediction.monthly} kg</p>
                <p className="mt-2 text-sm text-white/85">
                  Monthly estimate = avg daily ({analytics.prediction.averageDaily} kg) × 30
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
      <div className="mt-6 h-80">{children}</div>
    </div>
  );
}

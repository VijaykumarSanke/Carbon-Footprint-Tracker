import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { useTheme } from "../context/ThemeContext";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function ChartsPanel({ categoryTotals, weeklyTrend }) {
  const { isDark } = useTheme();
  const labelColor = isDark ? "#e2e8f0" : "#334155";
  const gridColor = isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(15, 23, 42, 0.08)";
  const pieData = {
    labels: ["Travel", "Food", "Electricity"],
    datasets: [
      {
        data: [
          categoryTotals.travel || 0,
          categoryTotals.food || 0,
          categoryTotals.electricity || 0,
        ],
        backgroundColor: ["#22c55e", "#4ade80", "#86efac"],
        borderWidth: 0,
      },
    ],
  };

  const lineData = {
    labels: weeklyTrend.map((item) => item.label),
    datasets: [
      {
        label: "Weekly Emissions",
        data: weeklyTrend.map((item) => item.value),
        borderColor: "#4ade80",
        backgroundColor: "rgba(74, 222, 128, 0.15)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: labelColor,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: labelColor },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: labelColor },
        grid: { color: gridColor },
      },
    },
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="glass-panel p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-500/70 dark:text-emerald-300/60">
          Emission Mix
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Pie chart overview</h2>
        <div className="mt-6 h-80">
          <Doughnut data={pieData} options={{ plugins: options.plugins, maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="glass-panel p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-500/70 dark:text-emerald-300/60">
          Trend
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Weekly emissions</h2>
        <div className="mt-6 h-80">
          <Line data={lineData} options={{ ...options, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

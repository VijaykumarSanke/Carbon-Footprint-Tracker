import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";

export default function HistoryPage() {
  const { activities, error, loading } = useAppData();

  return (
    <AppShell title="History" subtitle="Activity timeline">
      <div className="space-y-6 pb-10">
        <PageHeader
          eyebrow="History"
          title="Logged carbon activities"
          description="Review every saved activity with category, emission value, and timestamp."
        />

        {error ? (
          <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <section className="glass-panel overflow-hidden">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-emerald-500/10 px-6 py-4 text-sm uppercase tracking-[0.2em] text-slate-500 md:grid dark:text-slate-400">
            <span>Activity</span>
            <span>Category</span>
            <span>Emission</span>
            <span>Date</span>
          </div>
          <div className="divide-y divide-emerald-500/10">
            {activities.length ? (
              activities.map((activity) => (
                <div key={activity.id} className="grid gap-3 px-6 py-5 md:grid-cols-[2fr_1fr_1fr_1fr]">
                  <span className="font-medium text-slate-900 dark:text-white">{activity.description}</span>
                  <span className="text-slate-600 dark:text-slate-300">{activity.category}</span>
                  <span className="text-emerald-700 dark:text-emerald-300">{activity.emission} kg CO2e</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {new Date(activity.date).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                {loading ? "Loading activity history..." : "No history yet."}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

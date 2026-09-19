import { useState } from "react";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";

export default function AnalyzePage() {
  const { submitActivity, addRecommendationGoal, autoGoals } = useAppData();
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addingGoal, setAddingGoal] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const activity = description.trim();

      if (!activity && !image) {
        throw new Error("Provide activity text or an image.");
      }

      const payload = image
        ? (() => {
            const formData = new FormData();
            formData.append("activity", activity);
            formData.append("image", image);
            return formData;
          })()
        : {
            activity,
          };

      const response = await submitActivity(payload);
      setAnalysis(response.analysis);
      setDescription("");
      setImage(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToGoals(suggestion) {
    setAddingGoal(suggestion);
    setError("");

    try {
      await addRecommendationGoal({
        title: suggestion,
        target: analysis?.emission || 1,
        type: analysis?.category || "general",
        status: "active",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingGoal("");
    }
  }

  const addedGoalTitles = new Set(autoGoals.map((goal) => goal.title));

  return (
    <AppShell title="Analyze" subtitle="Add daily activity">
      <div className="space-y-6 pb-10">
        <PageHeader
          eyebrow="Activity analysis"
          title="Describe or upload an activity"
          description="Eco Track AI uses text and optional image OCR to detect the category, estimate emissions, and generate recommendations instantly."
        />

        {error ? (
          <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">New activity</h2>
            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <textarea
                rows={6}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-3xl border border-emerald-500/15 bg-white/70 px-4 py-4 text-slate-900 outline-none transition focus:border-emerald-400 dark:bg-white/5 dark:text-white"
                placeholder="Example: I traveled 10 km by car and used AC for 2 hours."
              />

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-400/30 bg-emerald-400/5 px-6 py-10 text-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setImage(event.target.files?.[0] || null)}
                />
                <p className="text-lg font-medium text-slate-900 dark:text-white">Upload image (optional)</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Bills, tickets, and receipts can be parsed using OCR.
                </p>
              </label>

              {image ? (
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-300">
                  Selected file: {image.name}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-400 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Analyzing..." : "Analyze Activity"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Analysis result</h2>
              {analysis ? (
                <div className="mt-6 space-y-4">
                  <ResultRow label="Category" value={analysis.category} />
                  <ResultRow label="Emission" value={`${analysis.emission} kg CO2e`} />
                  <ResultRow label="Insight" value={analysis.insights} />
                </div>
              ) : (
                <Placeholder text="Submit an activity to see the calculated result here." />
              )}
            </div>

            <div className="glass-panel p-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Recommendations</h2>
              <div className="mt-6 space-y-4">
                {analysis?.suggestions?.length ? (
                  analysis.suggestions.map((suggestion) => (
                    <div
                      key={suggestion}
                      className="rounded-3xl border border-emerald-500/10 bg-white/70 p-4 text-slate-700 dark:bg-white/5 dark:text-slate-200"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="pr-2">{suggestion}</p>
                        <button
                          type="button"
                          onClick={() => handleAddToGoals(suggestion)}
                          disabled={addingGoal === suggestion || addedGoalTitles.has(suggestion)}
                          className="rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {addedGoalTitles.has(suggestion)
                            ? "Added ✅"
                            : addingGoal === suggestion
                              ? "Adding..."
                              : "Add to Goals"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <Placeholder text="Recommendations will appear after analysis." />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ResultRow({ label, value }) {
  return (
    <div className="rounded-3xl border border-emerald-500/10 bg-white/70 p-4 dark:bg-white/5">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function Placeholder({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-emerald-500/20 px-4 py-10 text-center text-slate-500 dark:text-slate-400">
      {text}
    </div>
  );
}

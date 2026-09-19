import { ArrowRight, Leaf, ScanSearch, Sparkles, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const featureCards = [
  {
    title: "AI Analysis",
    description: "Translate everyday habits into carbon estimates with smart summaries.",
    icon: Sparkles,
  },
  {
    title: "OCR/Image Tracking",
    description: "Upload tickets, bills, and receipts to extract useful activity signals.",
    icon: ScanSearch,
  },
  {
    title: "Recommendations",
    description: "Get personalized actions that help reduce emissions week by week.",
    icon: Target,
  },
  {
    title: "Gamification",
    description: "Stay motivated with carbon score, levels, badges, and visible progress.",
    icon: Leaf,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <header className="mx-auto flex max-w-7xl items-center justify-between rounded-[2rem] border border-emerald-500/10 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-xl dark:bg-[#101915]/80">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">EcoTrack AI</p>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Modern carbon workspace</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const current = localStorage.getItem("theme") || "light";
              const next = current === "light" ? "dark" : "light";
              localStorage.setItem("theme", next);
              document.documentElement.classList.toggle("dark", next === "dark");
              document.documentElement.setAttribute("data-theme", next);
            }}
            className="rounded-full border border-emerald-500/15 bg-white px-4 py-2 text-sm font-medium text-slate-700 dark:bg-white/5 dark:text-slate-100"
          >
            Theme
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="mx-auto mt-10 max-w-7xl space-y-16 pb-16">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/10 bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-8 py-16 shadow-xl dark:from-[#0d1711] dark:via-[#09120d] dark:to-[#132117]">
          <div className="absolute inset-0 bg-grid bg-[size:28px_28px] opacity-20" />
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-600">Gamified AI Platform</p>
              <h2 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-6xl">
                Turn daily habits into clear carbon actions
              </h2>
              <p className="mt-6 max-w-2xl text-lg text-slate-700 dark:text-slate-300">
                EcoTrack AI helps teams and individuals understand emissions, track behavior, and act on recommendations through a polished SaaS-style experience.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/auth")}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#how-it-works"
                  className="rounded-full border border-emerald-500/25 bg-white/70 px-6 py-3 font-semibold text-slate-700 transition hover:-translate-y-0.5 dark:bg-white/5 dark:text-slate-100"
                >
                  Learn More
                </a>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80"
              alt="Green lifestyle and sustainability"
              className="h-[420px] w-full rounded-[2rem] object-cover shadow-2xl"
            />
          </div>
        </section>

        <section id="features" className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-600">Features</p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Everything you need in one carbon workspace</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-[2rem] border border-emerald-500/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:bg-[#101915]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{card.title}</h4>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{card.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <LandingSplitSection
          id="how-it-works"
          eyebrow="How it works"
          title="Input → Analyze → Improve"
          description="Capture a habit, let EcoTrack AI process text and images, then act on smart recommendations and goals."
          image="https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80"
          reverse={false}
          bullets={["Input daily activities", "Analyze emissions instantly", "Improve with actionable suggestions"]}
        />

        <LandingSplitSection
          eyebrow="Benefits"
          title="Reduce emissions without losing momentum"
          description="Track behavior changes, build goals, and use visible progress to make sustainability feel measurable and rewarding."
          image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
          reverse
          bullets={["Reduce emissions", "Track behavior", "Achieve goals"]}
        />

        <section className="rounded-[2.5rem] border border-emerald-500/10 bg-gradient-to-r from-emerald-500 to-lime-400 px-8 py-10 text-white shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/80">Start now</p>
              <h3 className="mt-2 text-3xl font-semibold">Bring clarity to every carbon decision</h3>
            </div>
            <button
              onClick={() => navigate("/auth")}
              className="rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Launch dashboard
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function LandingSplitSection({ id, eyebrow, title, description, image, reverse, bullets }) {
  return (
    <section
      id={id}
      className={`grid gap-8 rounded-[2.5rem] border border-emerald-500/10 bg-white p-6 shadow-sm dark:bg-[#101915] lg:grid-cols-2 lg:items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
    >
      <img src={image} alt={title} className="h-[360px] w-full rounded-[2rem] object-cover" />
      <div className="px-2 lg:px-6">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-600">{eyebrow}</p>
        <h3 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-4 text-slate-600 dark:text-slate-400">{description}</p>
        <div className="mt-6 space-y-3">
          {bullets.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-emerald-500/10 bg-[#f8fcf8] px-4 py-3 text-slate-700 dark:bg-white/5 dark:text-slate-300"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

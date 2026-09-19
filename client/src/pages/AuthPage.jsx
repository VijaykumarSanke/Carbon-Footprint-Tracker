import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(form) {
    setLoading(true);
    setError("");

    try {
      const response =
        mode === "signup" ? await api.signup(form) : await api.login({ email: form.email, password: form.password });

      login(response);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-grid bg-[size:28px_28px] opacity-20" />
      <div className="absolute h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-500/70 dark:text-emerald-300/60">
            Eco Intelligence
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight text-slate-900 dark:text-white">
            Turn daily habits into clear carbon actions.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-700 dark:text-slate-300">
            Analyze text and images, estimate emissions instantly, and get practical guidance that helps you reduce your footprint week by week.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <AuthForm mode={mode} onSubmit={handleSubmit} loading={loading} />
          {error ? <p className="text-sm text-red-500 dark:text-red-300">{error}</p> : null}
          <button
            onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))}
            className="text-sm text-emerald-700 underline decoration-emerald-500/40 underline-offset-4 dark:text-emerald-200"
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

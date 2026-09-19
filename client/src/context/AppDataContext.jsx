import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const AppDataContext = createContext(null);

const emptyDashboard = {
  totalEmission: 0,
  carbonScore: 100,
  categoryBreakdown: { transport: 0, food: 0, energy: 0 },
  weeklyTrend: [],
  recentActivities: [],
  goal: null,
};

const emptyAnalytics = {
  pieChart: [],
  weeklyEmissions: [],
  dailyActivity: [],
  insights: [],
  prediction: { averageDaily: 0, monthly: 0 },
};

export function AppDataProvider({ children }) {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [activities, setActivities] = useState([]);
  const [goal, setGoal] = useState(null);
  const [autoGoals, setAutoGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function refreshAll(activeToken = token) {
    if (!activeToken) {
      setDashboard(emptyDashboard);
      setAnalytics(emptyAnalytics);
      setActivities([]);
      setGoal(null);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        api.dashboard(activeToken),
        api.analytics(activeToken),
        api.activities(activeToken),
        api.getGoals(activeToken),
      ]);

      const [dashboardResult, analyticsResult, activitiesResult, goalsResult] = results;
      const failures = results.filter((result) => result.status === "rejected");

      if (dashboardResult.status === "fulfilled") {
        const dashboardData = dashboardResult.value;
        setDashboard({
          ...emptyDashboard,
          ...dashboardData,
          categoryBreakdown: {
            ...emptyDashboard.categoryBreakdown,
            ...(dashboardData.categoryBreakdown || {}),
          },
          weeklyTrend: dashboardData.weeklyTrend || [],
          recentActivities: dashboardData.recentActivities || [],
        });
      }

      if (analyticsResult.status === "fulfilled") {
        const analyticsData = analyticsResult.value;
        setAnalytics({
          ...emptyAnalytics,
          ...analyticsData,
          pieChart: analyticsData.pieChart || [],
          weeklyEmissions: analyticsData.weeklyEmissions || [],
          dailyActivity: analyticsData.dailyActivity || [],
          insights: analyticsData.insights || [],
        });
      }

      if (activitiesResult.status === "fulfilled") {
        setActivities(activitiesResult.value.activities || []);
      }

      if (goalsResult.status === "fulfilled") {
        setGoal(goalsResult.value.goal || null);
        setAutoGoals(goalsResult.value.autoGoals || []);
      }

      setError(failures.length ? failures[0].reason.message : "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveGoal(payload) {
    const response = await api.saveGoal(token, {
      title: payload.title,
      type: payload.type,
      target: payload.target,
      goalType: "target",
    });
    await refreshAll();
    return response;
  }

  async function submitActivity(formData) {
    const response = await api.analyze(token, formData);
    await refreshAll();
    return response;
  }

  async function addRecommendationGoal(payload) {
    const response = await api.addRecommendationGoal(token, {
      ...payload,
      goalType: "auto-generated",
    });
    await refreshAll();
    return response;
  }

  useEffect(() => {
    refreshAll(token);
  }, [token]);

  return (
    <AppDataContext.Provider
      value={{
        dashboard,
        analytics,
        activities,
        goal,
        autoGoals,
        loading,
        error,
        refreshAll,
        saveGoal,
        submitActivity,
        addRecommendationGoal,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}

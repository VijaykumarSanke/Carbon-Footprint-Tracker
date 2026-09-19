function round(value) {
  return Number(value.toFixed(2));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function formatDay(date) {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function getCategoryTotals(activities) {
  return activities.reduce(
    (acc, activity) => {
      acc[activity.category] += activity.emission;
      return acc;
    },
    { transport: 0, food: 0, energy: 0 }
  );
}

function getWeeklyTrend(activities) {
  const today = startOfDay(new Date());

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    const total = activities
      .filter((activity) => startOfDay(activity.date).getTime() === day.getTime())
      .reduce((sum, activity) => sum + activity.emission, 0);

    return {
      day: formatDay(day),
      date: day.toISOString(),
      emission: round(total),
    };
  });
}

export function calculateCarbonScore(totalEmission) {
  return round(clamp(100 - (totalEmission / 2000) * 100, 0, 100));
}

export function buildGoalProgress(goal, totalEmission) {
  if (!goal) {
    return null;
  }

  const activeEmission =
    goal.currentEmission !== undefined && goal.currentEmission !== null
      ? goal.currentEmission
      : totalEmission;
  const baselineEmission = goal.baselineEmission || Math.max(totalEmission, goal.target, 1);
  const progress =
    baselineEmission > goal.target
      ? clamp(((baselineEmission - activeEmission) / (baselineEmission - goal.target)) * 100, 0, 100)
      : activeEmission <= goal.target
        ? 100
        : 0;

  return {
    ...goal,
    baselineEmission: round(baselineEmission),
    currentEmission: round(activeEmission),
    progress: round(progress),
  };
}

export function buildDashboard(activities, goal) {
  const totalEmission = round(activities.reduce((sum, activity) => sum + activity.emission, 0));
  const categoryBreakdown = getCategoryTotals(activities);
  const weeklyTrend = getWeeklyTrend(activities);
  const recentActivities = activities.slice(0, 5).map((activity) => ({
    id: activity.id,
    description: activity.description,
    category: activity.category,
    emission: round(activity.emission),
    date: activity.date,
    insights: activity.insights,
  }));

  return {
    totalEmission,
    carbonScore: calculateCarbonScore(totalEmission),
    categoryBreakdown: Object.fromEntries(
      Object.entries(categoryBreakdown).map(([key, value]) => [key, round(value)])
    ),
    weeklyTrend,
    recentActivities,
    goal: buildGoalProgress(goal, totalEmission),
  };
}

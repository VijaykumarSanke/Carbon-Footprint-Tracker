function round(value) {
  return Number(value.toFixed(2));
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function formatShortDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function sumEmissions(activities) {
  return activities.reduce((sum, activity) => sum + activity.emission, 0);
}

function getDateWindow(daysBackStart, daysBackEnd) {
  const today = startOfDay(new Date());
  const start = new Date(today);
  start.setDate(today.getDate() - daysBackStart);
  const end = new Date(today);
  end.setDate(today.getDate() - daysBackEnd);
  return { start, end };
}

function getTransportChangeInsight(activities) {
  const currentWindow = getDateWindow(6, 0);
  const previousWindow = getDateWindow(13, 7);

  const currentTransport = sumEmissions(
    activities.filter((activity) => {
      const date = startOfDay(activity.date);
      return (
        activity.category === "transport" &&
        date >= currentWindow.start &&
        date <= currentWindow.end
      );
    })
  );

  const previousTransport = sumEmissions(
    activities.filter((activity) => {
      const date = startOfDay(activity.date);
      return (
        activity.category === "transport" &&
        date >= previousWindow.start &&
        date <= previousWindow.end
      );
    })
  );

  if (previousTransport <= 0) {
    return currentTransport > 0
      ? "Your transport emissions increased by 100% compared with the previous week."
      : "Transport emissions are stable with no recent increase.";
  }

  const delta = ((currentTransport - previousTransport) / previousTransport) * 100;
  const direction = delta >= 0 ? "increased" : "decreased";
  return `Your transport emissions ${direction} by ${Math.abs(round(delta))}%.`;
}

export function buildAnalytics(activities) {
  const categoryTotals = activities.reduce(
    (acc, activity) => {
      acc[activity.category] += activity.emission;
      return acc;
    },
    { transport: 0, food: 0, energy: 0 }
  );

  const pieChart = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: round(value),
  }));

  const dailyMap = new Map();
  for (let index = 6; index >= 0; index -= 1) {
    const date = startOfDay(new Date());
    date.setDate(date.getDate() - index);
    dailyMap.set(date.toISOString(), {
      date: date.toISOString(),
      label: formatShortDate(date),
      emission: 0,
      activities: 0,
    });
  }

  activities.forEach((activity) => {
    const key = startOfDay(activity.date).toISOString();
    if (!dailyMap.has(key)) {
      dailyMap.set(key, {
        date: key,
        label: formatShortDate(new Date(key)),
        emission: 0,
        activities: 0,
      });
    }
    const current = dailyMap.get(key);
    current.emission += activity.emission;
    current.activities += 1;
  });

  const orderedDays = [...dailyMap.values()]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item) => ({
      ...item,
      emission: round(item.emission),
    }));

  const totalEmission = sumEmissions(activities);
  const activeDays = orderedDays.filter((item) => item.activities > 0);
  const avgDaily = activeDays.length ? totalEmission / activeDays.length : 0;

  return {
    pieChart,
    weeklyEmissions: orderedDays.map((item) => ({
      label: item.label,
      emission: item.emission,
    })),
    dailyActivity: orderedDays.map((item) => ({
      label: item.label,
      count: item.activities,
    })),
    insights: [getTransportChangeInsight(activities)],
    prediction: {
      averageDaily: round(avgDaily),
      monthly: round(avgDaily * 30),
    },
  };
}

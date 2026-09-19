function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export async function awardBadgesForActivity({ store, userId, activities }) {
  const awardedBadges = [];

  if (activities.length === 1) {
    awardedBadges.push(await store.createBadgeIfMissing(userId, "Green Starter"));
  }

  if (activities.length >= 5) {
    awardedBadges.push(await store.createBadgeIfMissing(userId, "Consistent Tracker"));
  }

  const today = startOfDay(new Date());
  const todayTotal = activities
    .filter((activity) => startOfDay(activity.date).getTime() === today.getTime())
    .reduce((sum, activity) => sum + activity.carbonValue, 0);

  if (todayTotal > 0 && todayTotal <= 5) {
    awardedBadges.push(await store.createBadgeIfMissing(userId, "Low Carbon Day"));
  }

  return awardedBadges.filter(Boolean);
}

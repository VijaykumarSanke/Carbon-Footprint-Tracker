const KEYWORDS = {
  transport: ["car", "bus", "bike", "travel", "train", "metro", "ride", "trip", "commute"],
  food: ["food", "eat", "meal", "beef", "burger", "meat", "chicken", "rice", "lunch", "dinner"],
  energy: ["ac", "electricity", "power", "appliance", "fan", "heater", "washing machine"],
};

const TRANSPORT_FACTORS = {
  car: 0.2,
  bus: 0.1,
  bike: 0,
  train: 0.08,
  metro: 0.06,
};

function round(value) {
  return Number(value.toFixed(2));
}

function extractValue(text, patterns, fallback = 1) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return Number(match[1]);
    }
  }

  return fallback;
}

function extractTransport(text) {
  const matchedKeywords = KEYWORDS.transport.filter((keyword) => text.includes(keyword));
  const hasTransport = matchedKeywords.length > 0 || /\d+(?:\.\d+)?\s*(km|kilometers?)/.test(text);

  if (!hasTransport) {
    return {
      emission: 0,
      metadata: { transportMode: "", distanceKm: 0 },
      matchedKeywords: [],
    };
  }

  const mode = ["bike", "bus", "train", "metro", "car"].find((item) => text.includes(item)) || "car";
  const distanceKm = extractValue(text, [/(\d+(?:\.\d+)?)\s*km/, /(\d+(?:\.\d+)?)\s*kilometers?/]);

  return {
    emission: round(distanceKm * (TRANSPORT_FACTORS[mode] ?? 0.2)),
    metadata: { transportMode: mode, distanceKm: round(distanceKm) },
    matchedKeywords,
  };
}

function extractFood(text) {
  const matchedKeywords = KEYWORDS.food.filter((keyword) => text.includes(keyword));
  const hasFood = matchedKeywords.length > 0;

  if (!hasFood) {
    return {
      emission: 0,
      metadata: { foodType: "", servings: 0 },
      matchedKeywords: [],
    };
  }

  const servings = extractValue(
    text,
    [/(\d+(?:\.\d+)?)\s*(?:meal|meals|burger|burgers|plate|plates|serving|servings)/],
    1
  );

  let foodType = "meal";
  let factor = 1.5;

  if (text.includes("beef") || text.includes("burger") || text.includes("red meat")) {
    foodType = "beef";
    factor = 7;
  } else if (text.includes("chicken")) {
    foodType = "chicken";
    factor = 3;
  } else if (text.includes("rice")) {
    foodType = "rice";
    factor = 1.2;
  }

  return {
    emission: round(servings * factor),
    metadata: { foodType, servings: round(servings) },
    matchedKeywords,
  };
}

function extractEnergy(text) {
  const matchedKeywords = KEYWORDS.energy.filter((keyword) => text.includes(keyword));
  const hasEnergy = matchedKeywords.length > 0;

  if (!hasEnergy) {
    return {
      emission: 0,
      metadata: { durationHours: 0, energySource: "" },
      matchedKeywords: [],
    };
  }

  const durationHours = extractValue(text, [/(\d+(?:\.\d+)?)\s*hours?/, /(\d+(?:\.\d+)?)\s*hrs?/], 1);
  const energySource = text.includes("ac") ? "ac" : matchedKeywords[0] || "electricity";

  return {
    emission: round(durationHours * 0.5),
    metadata: { durationHours: round(durationHours), energySource },
    matchedKeywords,
  };
}

function getPrimaryCategory(categories) {
  const ordered = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  return ordered[0]?.[1] > 0 ? ordered[0][0] : "food";
}

function getIntensity(totalEmission) {
  if (totalEmission >= 8) return "high";
  if (totalEmission >= 3) return "medium";
  return "low";
}

function buildTransportRecommendation(transport, categories, intensity) {
  if (transport.emission <= 0) return null;

  const { transportMode, distanceKm } = transport.metadata;
  const savings = round(Math.max(0, distanceKm * 0.1));

  if (transportMode === "car" && distanceKm <= 3) {
    return `For a short ${distanceKm} km car trip, walking or cycling could avoid about ${round(
      transport.emission
    )} kg CO2.`;
  }

  if (transportMode === "car" && distanceKm <= 10) {
    return `For a ${distanceKm} km drive, switching one similar trip to public transport could cut roughly ${savings} kg CO2.`;
  }

  if (transportMode === "car") {
    return intensity === "high"
      ? `Your longer car travel is the biggest driver here; batching errands or carpooling would trim the highest-emission part of this activity.`
      : `Car travel added a noticeable share of emissions here, so replacing even one weekly trip with bus or rail would help.`;
  }

  if (transportMode === "bus" || transportMode === "train" || transportMode === "metro") {
    return `Your transport choice is already better than driving; pairing ${distanceKm} km trips with walking for first/last-mile travel would cut it further.`;
  }

  if (transportMode === "bike") {
    return categories.food > 0 || categories.energy > 0
      ? `Transport is already low-impact here, so the next gains will come from your food or energy choices instead.`
      : `Cycling kept transport emissions near zero, which is a strong pattern to keep repeating on similar trips.`;
  }

  return null;
}

function buildFoodRecommendation(food, intensity) {
  if (food.emission <= 0) return null;

  const { foodType, servings } = food.metadata;

  if (foodType === "beef") {
    return intensity === "high"
      ? `Replacing a beef-based meal like this with chicken or a plant-based option once or twice a week would significantly lower your food footprint.`
      : `Swapping beef for a lighter protein on similar meals would noticeably reduce the carbon impact of this choice.`;
  }

  if (foodType === "chicken") {
    return `If this chicken meal is a regular habit, mixing in one plant-based meal each week would steadily reduce your food emissions.`;
  }

  if (foodType === "rice") {
    return `This is a relatively mild food footprint, and adding more legumes or vegetables alongside rice would keep it efficient and balanced.`;
  }

  return servings > 1
    ? `Because this looks like more than one serving, planning portions more tightly could reduce repeat food emissions without changing the meal completely.`
    : `This meal is not especially high impact, so small shifts toward more plant-forward ingredients would be enough to improve it.`;
}

function buildEnergyRecommendation(energy, intensity) {
  if (energy.emission <= 0) return null;

  const { durationHours, energySource } = energy.metadata;

  if (energySource === "ac" && durationHours >= 5) {
    return `Running AC for ${durationHours} hours is the main energy driver here; trimming 1-2 hours or raising the thermostat slightly would reduce emissions quickly.`;
  }

  if (energySource === "ac") {
    return `Because the AC ran for ${durationHours} hours, using a fan for part of that time would shave off a meaningful share of this energy use.`;
  }

  return intensity === "high"
    ? `Energy use is contributing heavily here, so shortening appliance runtime and switching off idle devices would have an immediate payoff.`
    : `Energy use is moderate here, and cutting runtime a little on similar days would be the easiest next step.`;
}

function buildCombinationRecommendation(categories, intensity) {
  const active = Object.entries(categories).filter(([, value]) => value > 0);

  if (active.length < 2) return null;

  const names = active
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  if (names.includes("food") && names.includes("transport")) {
    return intensity === "high"
      ? `This activity mixes two high-impact habits: travel and diet. Tackling both together, like a lower-meat meal on days you drive, would create a bigger reduction than changing only one.`
      : `Both transport and food contributed here, so even one lighter meal plus one lower-carbon trip this week would reduce this pattern noticeably.`;
  }

  if (names.includes("energy") && names.includes("transport")) {
    return `Your footprint is split between mobility and home energy, so pairing shorter AC use with one less car trip would target both major sources at once.`;
  }

  if (names.includes("energy") && names.includes("food")) {
    return `The emissions here come from both home energy and food, so modest changes in both areas would work better than a single aggressive change.`;
  }

  return null;
}

function buildSuggestions(breakdown) {
  const totalEmission = round(
    breakdown.transport.emission + breakdown.food.emission + breakdown.energy.emission
  );
  const categories = {
    transport: breakdown.transport.emission,
    food: breakdown.food.emission,
    energy: breakdown.energy.emission,
  };
  const intensity = getIntensity(totalEmission);

  const suggestions = [
    buildTransportRecommendation(breakdown.transport, categories, intensity),
    buildFoodRecommendation(breakdown.food, intensity),
    buildEnergyRecommendation(breakdown.energy, intensity),
    buildCombinationRecommendation(categories, intensity),
  ].filter(Boolean);

  return [...new Set(suggestions)].slice(0, 3);
}

function buildInsight(categories, totalEmission, primaryCategory) {
  if (totalEmission <= 0) {
    return "This activity has little measurable carbon impact based on the details provided.";
  }

  const primaryShare = round((categories[primaryCategory] / totalEmission) * 100);
  const activeCategories = Object.entries(categories).filter(([, value]) => value > 0).length;

  if (activeCategories > 1) {
    return `${capitalize(primaryCategory)} contributed about ${primaryShare}% of this activity's emissions, with the rest coming from the other actions in the same entry.`;
  }

  return `${capitalize(primaryCategory)} drove nearly all of this activity's footprint at about ${totalEmission} kg CO2e.`;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function analyzeActivity({ description = "", imageText = "" }) {
  const normalizedDescription = description.trim();
  const combinedText = `${normalizedDescription} ${imageText}`.trim().toLowerCase();

  const transport = extractTransport(combinedText);
  const food = extractFood(combinedText);
  const energy = extractEnergy(combinedText);

  const categories = {
    transport: transport.emission,
    food: food.emission,
    energy: energy.emission,
  };
  const emission = round(categories.transport + categories.food + categories.energy);
  const category = getPrimaryCategory(categories);
  const matchedKeywords = [
    ...transport.matchedKeywords,
    ...food.matchedKeywords,
    ...energy.matchedKeywords,
  ];

  return {
    description: normalizedDescription || imageText || "Logged activity",
    emission,
    category,
    suggestions: buildSuggestions({ transport, food, energy }),
    insights: buildInsight(categories, emission, category),
    metadata: {
      transportMode: transport.metadata.transportMode,
      distanceKm: transport.metadata.distanceKm || 0,
      durationHours: energy.metadata.durationHours || 0,
      foodType: food.metadata.foodType || "",
      servings: food.metadata.servings || 0,
      matchedKeywords: [...new Set(matchedKeywords)],
      categories,
    },
  };
}

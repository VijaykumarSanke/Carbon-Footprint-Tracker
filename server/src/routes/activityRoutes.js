import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.js";
import { analyzeActivity } from "../services/analysisService.js";
import { buildAnalytics } from "../services/analyticsService.js";
import { buildDashboard, buildGoalProgress } from "../services/dashboardService.js";
import { extractTextFromImage } from "../services/ocrService.js";
import { store } from "../services/store.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getGoalType(title = "", providedType = "") {
  if (providedType) return providedType;

  const lowered = title.toLowerCase();
  if (lowered.match(/car|bus|bike|train|travel|trip|transport/)) return "transport";
  if (lowered.match(/ac|electricity|energy|fan|appliance|power/)) return "energy";
  if (lowered.match(/beef|burger|meal|food|eat|rice|chicken/)) return "food";
  return "general";
}

function getEmissionForGoalType(activities, type) {
  if (!type || type === "general") {
    return activities.reduce((sum, activity) => sum + activity.emission, 0);
  }

  return activities
    .filter((activity) => activity.category === type)
    .reduce((sum, activity) => sum + activity.emission, 0);
}

async function recalculateAutoGoalsProgress(userId) {
  const [activities, autoGoals] = await Promise.all([
    store.getActivitiesForUser(userId),
    store.getAutoGoalsForUser(userId),
  ]);

  const updatedGoals = await Promise.all(
    autoGoals.map(async (goal) => {
      const matchingActivities =
        goal.type && goal.type !== "general"
          ? activities.filter((activity) => activity.category === goal.type).slice(0, 5)
          : activities.slice(0, 5);

      const currentEmission = Number(
        average(matchingActivities.map((activity) => activity.emission)).toFixed(2)
      );
      const baseline = goal.baselineEmission || goal.target || currentEmission || 1;
      const target = goal.target || baseline;
      const progress =
        target > 0 ? clamp(((target - currentEmission) / target) * 100, 0, 100) : 0;

      return store.updateAutoGoal(goal.id, {
        currentEmission,
        baselineEmission: baseline,
        progress: Number(progress.toFixed(2)),
      });
    })
  );

  return updatedGoals.filter(Boolean);
}

router.post("/analyze", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    const activity = (req.body.activity || req.body.description || req.body.activityText || "").trim();
    console.log("ACTIVITY:", activity);

    if (!activity && !req.file) {
      return res.status(400).json({ message: "Provide activity text or an image." });
    }

    const prompt = `
Analyze this activity:

${activity}

Return JSON only.
`;
    console.log("ANALYZE PROMPT:", prompt.trim());

    const imageText = req.file ? await extractTextFromImage(req.file) : "";
    const analysis = await analyzeActivity({ description: activity, imageText });

    const savedActivity = await store.createActivity({
      userId: req.user.id,
      description: analysis.description,
      category: analysis.category,
      emission: analysis.emission,
      suggestions: analysis.suggestions,
      insights: analysis.insights,
      sourceText: activity,
      imageText,
      metadata: analysis.metadata,
      date: new Date(),
    });

    await recalculateAutoGoalsProgress(req.user.id);

    res.status(201).json({
      activity: savedActivity,
      analysis,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to analyze activity." });
  }
});

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const [activities, goal] = await Promise.all([
      store.getActivitiesForUser(req.user.id),
      store.getGoalForUser(req.user.id),
    ]);

    res.json(buildDashboard(activities, goal));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load dashboard." });
  }
});

router.get("/analytics", authMiddleware, async (req, res) => {
  try {
    const activities = await store.getActivitiesForUser(req.user.id);
    res.json(buildAnalytics(activities));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load analytics." });
  }
});

router.get("/activities", authMiddleware, async (req, res) => {
  try {
    const activities = await store.getActivitiesForUser(req.user.id);
    res.json({ activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load activities." });
  }
});

router.post("/goals", authMiddleware, async (req, res) => {
  try {
    console.log("Incoming goal:", req.body);

    const title = req.body.title?.trim();
    const goalType = req.body.goalType?.trim() || "";
    const type = getGoalType(title, req.body.type?.trim());
    const status = req.body.status?.trim() || "active";
    const target = Number(req.body.target);

    if (title && goalType === "auto-generated") {
      const result = await store.createAutoGoal(req.user.id, {
        title,
        type,
        target,
        status,
      });

      const autoGoals = await recalculateAutoGoalsProgress(req.user.id);

      return res.status(result.created ? 201 : 200).json({
        success: true,
        goal: result.goal,
        created: result.created,
        autoGoals,
      });
    }

    if (!title || !type || !target) {
      return res.status(400).json({ error: "Missing fields", message: "Missing fields" });
    }

    if (target <= 0) {
      return res.status(400).json({
        error: "Target must be greater than 0",
        message: "Target must be greater than 0",
      });
    }

    const activities = await store.getActivitiesForUser(req.user.id);
    const existingGoal = await store.getGoalForUser(req.user.id);
    const targetType = type || getGoalType(title);
    const goalEmission = getEmissionForGoalType(activities, targetType);
    const baselineEmission = existingGoal?.baselineEmission || goalEmission || target;
    const draftGoal = {
      ...(existingGoal || {}),
      title,
      type: targetType,
      target,
      progress: 0,
      status,
      baselineEmission,
      currentEmission: goalEmission,
      createdAt: new Date(),
    };
    const progressGoal = buildGoalProgress(draftGoal, goalEmission);
    const savedGoal = await store.addGoal(req.user.id, progressGoal);

    return res.status(200).json({
      success: true,
      goal: savedGoal,
    });
  } catch (error) {
    console.error("Goal save error:", error);
    return res.status(500).json({ error: "Server error", message: "Server error" });
  }
});

router.get("/goals", authMiddleware, async (req, res) => {
  try {
    const [goal, autoGoals, activities] = await Promise.all([
      store.getGoalForUser(req.user.id),
      recalculateAutoGoalsProgress(req.user.id),
      store.getActivitiesForUser(req.user.id),
    ]);

    const totalEmission = activities.reduce((sum, activity) => sum + activity.emission, 0);
    const goalEmission = goal ? getEmissionForGoalType(activities, goal.type) : totalEmission;
    res.json({
      goal: buildGoalProgress(goal, goalEmission),
      autoGoals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load goal." });
  }
});

export default router;

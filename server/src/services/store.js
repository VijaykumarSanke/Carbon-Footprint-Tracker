import { randomUUID } from "node:crypto";
import { ActivityModel, GoalModel, UserModel } from "../models/mongoose.js";
import { mongoEnabled } from "./db.js";

const memory = {
  users: [],
  activities: [],
  goals: [],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeId(doc) {
  if (!doc) return null;
  const plain = typeof doc.toObject === "function" ? doc.toObject() : clone(doc);
  plain.id = String(plain._id || plain.id);
  delete plain._id;
  delete plain.__v;
  return plain;
}

function sortByDateDesc(items) {
  return [...items].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
}

function inferGoalType(title = "") {
  const lowered = title.toLowerCase();
  if (lowered.match(/car|bus|bike|train|travel|trip|transport/)) return "transport";
  if (lowered.match(/ac|electricity|energy|fan|appliance|power/)) return "energy";
  if (lowered.match(/beef|burger|meal|food|eat|rice|chicken/)) return "food";
  return "general";
}

export const store = {
  async findUserByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();

    if (mongoEnabled()) {
      return normalizeId(await UserModel.findOne({ email: normalizedEmail }));
    }

    const user = memory.users.find((entry) => entry.email === normalizedEmail);
    return user ? clone(user) : null;
  },

  async createUser(payload) {
    const normalized = {
      ...payload,
      email: payload.email.trim().toLowerCase(),
      name: payload.name.trim(),
    };

    if (mongoEnabled()) {
      return normalizeId(await UserModel.create(normalized));
    }

    const user = { id: randomUUID(), ...normalized, createdAt: new Date().toISOString() };
    memory.users.push(user);
    return clone(user);
  },

  async findUserById(id) {
    if (mongoEnabled()) {
      return normalizeId(await UserModel.findById(id));
    }

    const user = memory.users.find((entry) => entry.id === id);
    return user ? clone(user) : null;
  },

  async createActivity(payload) {
    const normalized = {
      ...payload,
      date: payload.date ? new Date(payload.date) : new Date(),
    };

    if (mongoEnabled()) {
      return normalizeId(await ActivityModel.create(normalized));
    }

    const activity = {
      id: randomUUID(),
      ...normalized,
      date: normalized.date.toISOString(),
      createdAt: new Date().toISOString(),
    };
    memory.activities.push(activity);
    return clone(activity);
  },

  async getActivitiesForUser(userId) {
    if (mongoEnabled()) {
      const activities = await ActivityModel.find({ userId }).sort({ date: -1 }).lean();
      return activities.map(normalizeId);
    }

    return clone(sortByDateDesc(memory.activities.filter((entry) => entry.userId === userId)));
  },

  async upsertGoal(userId, payload) {
    const normalized = {
      userId,
      goalType: "target",
      title: payload.title?.trim() || "",
      type: payload.type || "general",
      status: payload.status || "active",
      target: Number(payload.target) || 0,
      baselineEmission: Number(payload.baselineEmission) || 0,
      currentEmission: Number(payload.currentEmission) || 0,
      progress: Number(payload.progress) || 0,
    };

    if (mongoEnabled()) {
      const goal = await GoalModel.findOneAndUpdate({ userId, goalType: "target" }, normalized, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      });
      return normalizeId(goal);
    }

    const existing = memory.goals.find(
      (entry) => entry.userId === userId && entry.goalType === "target"
    );
    if (existing) {
      Object.assign(existing, normalized, { updatedAt: new Date().toISOString() });
      return clone(existing);
    }

    const goal = {
      id: randomUUID(),
      ...normalized,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memory.goals.push(goal);
    return clone(goal);
  },

  async addGoal(userId, goal) {
    const normalized = {
      userId,
      goalType: "target",
      title: goal.title?.trim() || "",
      type: goal.type || "general",
      target: Number(goal.target) || 0,
      progress: Number(goal.progress) || 0,
      status: goal.status || "active",
      baselineEmission: Number(goal.baselineEmission) || Number(goal.target) || 0,
      currentEmission: Number(goal.currentEmission) || 0,
    };

    if (mongoEnabled()) {
      const savedGoal = await GoalModel.findOneAndUpdate(
        { userId, goalType: "target" },
        normalized,
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
      return normalizeId(savedGoal);
    }

    const existing = memory.goals.find(
      (entry) => entry.userId === userId && entry.goalType === "target"
    );

    if (existing) {
      Object.assign(existing, normalized, { updatedAt: new Date().toISOString() });
      return clone(existing);
    }

    const savedGoal = {
      id: randomUUID(),
      ...normalized,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memory.goals.push(savedGoal);
    return clone(savedGoal);
  },

  async getGoalForUser(userId) {
    if (mongoEnabled()) {
      return normalizeId(await GoalModel.findOne({ userId, goalType: "target" }));
    }

    const goal = memory.goals.find((entry) => entry.userId === userId && entry.goalType === "target");
    return goal ? clone(goal) : null;
  },

  async createAutoGoal(userId, payload) {
    const normalizedTitle = payload.title.trim();
    const type = payload.type || inferGoalType(normalizedTitle);
    const target = Number(payload.target) || 0;
    const baselineEmission = Number(payload.baselineEmission) || target || 0;

    if (mongoEnabled()) {
      const existing = await GoalModel.findOne({
        userId,
        goalType: "auto-generated",
        title: normalizedTitle,
      }).lean();

      if (existing) {
        return { goal: normalizeId(existing), created: false };
      }

      const goal = await GoalModel.create({
        userId,
        goalType: "auto-generated",
        type,
        title: normalizedTitle,
        status: payload.status || "active",
        progress: 0,
        target,
        baselineEmission,
        currentEmission: baselineEmission,
      });
      return { goal: normalizeId(goal), created: true };
    }

    const existing = memory.goals.find(
      (entry) =>
        entry.userId === userId &&
        entry.goalType === "auto-generated" &&
        entry.title === normalizedTitle
    );

    if (existing) {
      return { goal: clone(existing), created: false };
    }

    const goal = {
      id: randomUUID(),
      userId,
      goalType: "auto-generated",
      type,
      title: normalizedTitle,
      status: payload.status || "active",
      progress: 0,
      target,
      baselineEmission,
      currentEmission: baselineEmission,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memory.goals.push(goal);
    return { goal: clone(goal), created: true };
  },

  async getAutoGoalsForUser(userId) {
    if (mongoEnabled()) {
      const goals = await GoalModel.find({ userId, goalType: "auto-generated" })
        .sort({ createdAt: -1 })
        .lean();
      return goals.map(normalizeId);
    }

    return clone(
      sortByDateDesc(
        memory.goals.filter(
          (entry) => entry.userId === userId && entry.goalType === "auto-generated"
        )
      )
    );
  },

  async updateAutoGoal(goalId, payload) {
    if (mongoEnabled()) {
      const updated = await GoalModel.findOneAndUpdate(
        { _id: goalId, goalType: "auto-generated" },
        payload,
        { new: true }
      );
      return normalizeId(updated);
    }

    const existing = memory.goals.find(
      (entry) => entry.id === goalId && entry.goalType === "auto-generated"
    );
    if (!existing) {
      return null;
    }

    Object.assign(existing, payload, { updatedAt: new Date().toISOString() });
    return clone(existing);
  },
};

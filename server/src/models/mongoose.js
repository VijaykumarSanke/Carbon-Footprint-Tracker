import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["transport", "food", "energy"],
      required: true,
    },
    emission: { type: Number, required: true, min: 0 },
    suggestions: [{ type: String }],
    insights: { type: String, default: "" },
    sourceText: { type: String, default: "" },
    imageText: { type: String, default: "" },
    metadata: {
      transportMode: { type: String, default: "" },
      distanceKm: { type: Number, default: 0 },
      durationHours: { type: Number, default: 0 },
      foodType: { type: String, default: "" },
      servings: { type: Number, default: 0 },
      categories: {
        transport: { type: Number, default: 0 },
        food: { type: Number, default: 0 },
        energy: { type: Number, default: 0 },
      },
      matchedKeywords: [{ type: String }],
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const goalSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    goalType: {
      type: String,
      enum: ["target", "auto-generated"],
      default: "target",
      index: true,
    },
    type: {
      type: String,
      enum: ["transport", "food", "energy", "general"],
      default: "general",
    },
    title: { type: String, default: "" },
    status: { type: String, default: "active" },
    target: { type: Number, default: 0 },
    baselineEmission: { type: Number, default: 0 },
    currentEmission: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export const ActivityModel =
  mongoose.models.Activity || mongoose.model("Activity", activitySchema);
export const GoalModel = mongoose.models.Goal || mongoose.model("Goal", goalSchema);

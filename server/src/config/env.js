import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5056,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "ecotrack-dev-secret",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

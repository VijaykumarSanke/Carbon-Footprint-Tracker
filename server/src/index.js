import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./services/db.js";

const app = createApp();

connectDatabase().finally(() => {
  app.listen(env.port, () => {
    console.log(`EcoTrack AI server running on port ${env.port}`);
  });
});

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./db/migrations-sqlite",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "local.db",
  },
  verbose: true,
});

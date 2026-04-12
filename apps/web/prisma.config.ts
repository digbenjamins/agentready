import path from "node:path";
import { defineConfig } from "prisma/config";

// Load .env manually since Prisma 7 config runs before env is loaded
import { config } from "dotenv";
config({ path: path.join(__dirname, ".env") });

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
});

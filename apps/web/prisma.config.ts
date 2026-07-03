import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

// Load .env.local explicitly to match Next.js behavior
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/goklinik",
  },
});

import { PrismaClient } from "../../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export { prisma };

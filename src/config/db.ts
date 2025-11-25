import { PrismaClient } from "@prisma/client";
import logger from "@utils/logger";

const prisma = new PrismaClient();

export async function connectDB() {
  try {
    await prisma.$connect();
    logger.info("Connected to Postgres using Prisma!");
  } catch (error) {
    logger.error("Prosgres connection failed:", error);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await prisma.$disconnect();
  logger.info("Disconnected from Postgres.");
}

export default prisma;

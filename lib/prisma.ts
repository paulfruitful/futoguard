import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Initialize Prisma with event logging
export const prisma = globalForPrisma.prisma ?? (() => {
  const client = new PrismaClient({
    log: ['info', 'warn', 'error'], // Standard logging
  });

  // Add connection event listeners
  client.$on('beforeExit', () => {
    console.log('🛑 Prisma client is disconnecting...');
  });

  client.$use(async (params, next) => {
    console.log(`⚡ Prisma query: ${params.model}.${params.action}`);
    return next(params);
  });

  console.log('✅ Prisma client connected');
  return client;
})();

// For development, reuse the same instance
if (process.env.NODE_ENV !== "production") {
  if (!globalForPrisma.prisma) {
    console.log('🔌 Initializing new Prisma client instance');
    globalForPrisma.prisma = prisma;
  } else {
    console.log('♻️ Reusing existing Prisma client instance');
  }
}
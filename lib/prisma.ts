import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Initialize Prisma with logging
export const prisma = globalForPrisma.prisma ?? (() => {
  const client = new PrismaClient({
    log: [
      { level: 'warn', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'info', emit: 'event' }
    ],
  });

  // Middleware for query logging (optional)
  client.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;
    console.log(`⚡ Prisma query: ${params.model}.${params.action} took ${duration}ms`);
    return result;
  });

  // Event logging (alternative to $on)
  client.$on('query', (e) => {
    console.log(`🔍 Query: ${e.query} | Duration: ${e.duration}ms`);
  });

  client.$on('info', (e) => {
    console.log(`ℹ️ Info: ${e.message}`);
  });

  client.$on('warn', (e) => {
    console.log(`⚠️ Warning: ${e.message}`);
  });

  client.$on('error', (e) => {
    console.error(`❌ Error: ${e.message}`);
  });

  console.log('✅ Prisma client connected');
  return client;
})();

// Development-specific handling
if (process.env.NODE_ENV !== "production") {
  if (!globalForPrisma.prisma) {
    console.log('🔌 Initializing new Prisma client instance');
    globalForPrisma.prisma = prisma;
  }

  // Cleanup on process exit
  process.on('beforeExit', async () => {
    console.log('🛑 Application is shutting down...');
    await prisma.$disconnect();
    console.log('👋 Prisma client disconnected');
  });
}

// For production, ensure proper disconnection
if (process.env.NODE_ENV === "production") {
  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
  });
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
  });
}
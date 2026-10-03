import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Development hot reload can retain a Prisma client from an older generated schema.
// Discard that client when required game/score fields are absent; restart dev after schema changes.
const cached = globalForPrisma.prisma;
const reusable = cached?.game && "difficulty" in cached.game.fields && "score" in cached.user.fields ? cached : undefined;

if (cached && !reusable) {
  void cached.$disconnect().catch(() => {});
}

export const prisma =
  reusable ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

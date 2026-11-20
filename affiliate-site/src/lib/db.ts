import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * One import for the whole app:
 *  - On Cloudflare Workers, uses the D1 database bound as `DB` (wrangler.jsonc).
 *  - Anywhere else (VPS / `next start`), uses the SQLite file from DATABASE_URL.
 */

type D1Like = ConstructorParameters<typeof PrismaD1>[0];

const d1Clients = new WeakMap<object, PrismaClient>();
const globalForPrisma = globalThis as unknown as { prismaFile?: PrismaClient };

function d1Binding(): D1Like | undefined {
  try {
    const { env } = getCloudflareContext();
    return (env as unknown as { DB?: D1Like }).DB;
  } catch {
    return undefined; // not running on Cloudflare
  }
}

function getClient(): PrismaClient {
  const db = d1Binding();
  if (db) {
    let client = d1Clients.get(db as object);
    if (!client) {
      client = new PrismaClient({ adapter: new PrismaD1(db) });
      d1Clients.set(db as object, client);
    }
    return client;
  }
  globalForPrisma.prismaFile ??= new PrismaClient();
  return globalForPrisma.prismaFile;
}

/** Resolves the right client lazily on each use, so it works per-request on Workers. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

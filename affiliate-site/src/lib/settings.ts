import { cache } from "react";
import { prisma } from "./db";

export const getSettings = cache(async () => {
  const s = await prisma.setting.findUnique({ where: { id: 1 } });
  if (s) return s;
  return prisma.setting.create({ data: { id: 1 } });
});

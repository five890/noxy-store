import { z } from "zod";
import { getAdminStats } from "../db";
import { adminProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

export const adminRouter = router({
  stats: adminProcedure.query(() => getAdminStats()),

  uploadImage: adminProcedure
    .input(
      z.object({
        base64: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.filename.split(".").pop() ?? "jpg";
      const key = `products/${nanoid()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { url, key };
    }),

  diagnoseDb: adminProcedure.query(async () => {
    const { getDb } = await import("../db");
    const { sql } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) return { error: "No DB connection" };
    
    const tables = await db.execute(sql`SHOW TABLES`);
    const categoriesStructure = await db.execute(sql`DESCRIBE categories`).catch(() => "Table categories not found");
    const productsStructure = await db.execute(sql`DESCRIBE products`).catch(() => "Table products not found");
    
    return {
      tables,
      categoriesStructure,
      productsStructure
    };
  }),
});

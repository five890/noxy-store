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
});

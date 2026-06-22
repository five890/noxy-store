import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryBySlug,
  getFeaturedCategories,
  updateCategory,
} from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

export const categoriesRouter = router({
  list: publicProcedure.query(() => getAllCategories()),

  featured: publicProcedure.query(() => getFeaturedCategories()),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const cat = await getCategoryBySlug(input.slug);
      if (!cat) throw new TRPCError({ code: "NOT_FOUND", message: "Categoria não encontrada" });
      return cat;
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        featured: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createCategory(input);
      return { success: true };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        featured: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateCategory(id, data);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteCategory(input.id);
      return { success: true };
    }),
});

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  addProductImage,
  createProduct,
  deleteProduct,
  deleteProductImage,
  getProductById,
  getProductBySlug,
  getProductImages,
  getProducts,
  updateProduct,
} from "../db";
import { adminProcedure, adminOrLocalProcedure, publicProcedure, router } from "../_core/trpc";

export const productsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        onSale: z.boolean().optional(),
        featured: z.boolean().optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }).optional()
    )
    .query(async ({ input }) => getProducts(input ?? {})),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const product = await getProductBySlug(input.slug);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado" });
      const images = await getProductImages(product.id);
      return { ...product, images };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const product = await getProductById(input.id);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado" });
      const images = await getProductImages(product.id);
      return { ...product, images };
    }),

  create: adminOrLocalProcedure
    .input(
      z.object({
        categoryId: z.number(),
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        price: z.string(),
        compareAtPrice: z.string().optional(),
        stock: z.number().optional(),
        featured: z.boolean().optional(),
        onSale: z.boolean().optional(),
        active: z.boolean().optional(),
        coverImageUrl: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createProduct(input as any);
      return { success: true };
    }),

  update: adminOrLocalProcedure
    .input(
      z.object({
        id: z.number(),
        categoryId: z.number().optional(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        compareAtPrice: z.string().optional().nullable(),
        stock: z.number().optional(),
        featured: z.boolean().optional(),
        onSale: z.boolean().optional(),
        active: z.boolean().optional(),
        coverImageUrl: z.string().optional().nullable(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateProduct(id, data as any);
      return { success: true };
    }),

  delete: adminOrLocalProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteProduct(input.id);
      return { success: true };
    }),

  addImage: adminOrLocalProcedure
    .input(
      z.object({
        productId: z.number(),
        url: z.string(),
        altText: z.string().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await addProductImage(input);
      return { success: true };
    }),

  deleteImage: adminOrLocalProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteProductImage(input.id);
      return { success: true };
    }),
});

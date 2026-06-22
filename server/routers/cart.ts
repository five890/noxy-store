import { z } from "zod";
import { clearCart, getCartItems, removeCartItem, upsertCartItem } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const cartRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const items = await getCartItems(ctx.user.id);
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.productPrice) * item.quantity,
      0
    );
    return { items, subtotal };
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1).max(99),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await upsertCartItem(ctx.user.id, input.productId, input.quantity);
      return { success: true };
    }),

  remove: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await removeCartItem(ctx.user.id, input.productId);
      return { success: true };
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    await clearCart(ctx.user.id);
    return { success: true };
  }),
});

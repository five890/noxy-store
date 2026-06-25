import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  clearCart,
  createOrder,
  getAllOrders,
  getCartItems,
  getDb,
  getOrderById,
  getOrderItems,
  getOrdersByUser,
  updateOrderStatus,
} from "../db";
import { orders } from "../../drizzle/schema";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";

export const ordersRouter = router({
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    return getOrdersByUser(ctx.user.id);
  }),

  myOrderDetail: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const order = await getOrderById(input.id);
      if (!order || order.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pedido não encontrado" });
      }
      const items = await getOrderItems(order.id);
      return { ...order, items };
    }),

  createFromCart: protectedProcedure
    .input(
      z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email(),
        shippingAddress: z.string().min(1),
        recipientName: z.string().min(1),
        street: z.string().min(1),
        number: z.string().min(1),
        complement: z.string().optional(),
        addressType: z.enum(["house", "apartment", "condominium", "commercial", "other"]),
        paymentMethod: z.enum(["stripe", "pix"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cartItemsList = await getCartItems(ctx.user.id);
      if (cartItemsList.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Carrinho está vazio" });
      }

      const totalAmount = cartItemsList
        .reduce((sum, item) => sum + Number(item.productPrice) * item.quantity, 0)
        .toFixed(2);

      const orderId = await createOrder(
        {
          userId: ctx.user.id,
          totalAmount,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          shippingAddress: input.shippingAddress,
          recipientName: input.recipientName,
          street: input.street,
          number: input.number,
          complement: input.complement || null,
          addressType: input.addressType,
          status: "pending",
          paymentMethod: input.paymentMethod ?? "stripe",
        },
        cartItemsList.map((item) => ({
          orderId: 0,
          productId: item.productId,
          productName: item.productName ?? "",
          productImageUrl: item.productCoverImageUrl ?? null,
          quantity: item.quantity,
          unitPrice: item.productPrice,
          totalPrice: String(Number(item.productPrice) * item.quantity),
        }))
      );

      return { orderId };
    }),

  // Admin procedures
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => getAllOrders(input?.limit, input?.offset)),

  adminDetail: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const order = await getOrderById(input.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Pedido não encontrado" });
      const items = await getOrderItems(order.id);
      return { ...order, items };
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateOrderStatus(input.id, input.status);
      return { success: true };
    }),

  updateDeliveryDate: adminProcedure
    .input(
      z.object({
        id: z.number(),
        estimatedDeliveryDate: z.date().or(z.null()),
      })
    )
    .mutation(async ({ input }) => {
      const order = await getOrderById(input.id);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pedido nao encontrado" });
      }
      
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      
      await db
        .update(orders)
        .set({ estimatedDeliveryDate: input.estimatedDeliveryDate })
        .where(eq(orders.id, input.id));
      
      return { success: true };
    }),
});

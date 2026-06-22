import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { categoriesRouter } from "./routers/categories";
import { productsRouter } from "./routers/products";
import { cartRouter } from "./routers/cart";
import { ordersRouter } from "./routers/orders";
import { adminRouter } from "./routers/admin";
import { paymentsRouter } from "./routers/payments";
import { paymentProofsRouter } from "./routers/payment-proofs";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  categories: categoriesRouter,
  products: productsRouter,
  cart: cartRouter,
  orders: ordersRouter,
  admin: adminRouter,
  payments: paymentsRouter,
  paymentProofs: paymentProofsRouter,
});

export type AppRouter = typeof appRouter;

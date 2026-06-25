import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
  }
  return next({ ctx });
});

// Admin procedure que aceita admin local (localStorage) ou admin remoto (Manus)
export const adminOrLocalProcedure = t.procedure.use(({ ctx, next }) => {
  // Verificar se é admin remoto (Manus)
  if (ctx.user && ctx.user.role === "admin") {
    return next({ ctx });
  }
  
  // Verificar se é admin local (header)
  // Headers HTTP são sempre lowercase
  const adminToken = (ctx.req.headers["x-admin-token"] as string) || ctx.req.get?.("x-admin-token");
  if (adminToken === "local-admin") {
    return next({ ctx });
  }
  
  console.error("[adminOrLocalProcedure] Acesso negado. User:", ctx.user?.role, "Token:", adminToken);
  throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
});

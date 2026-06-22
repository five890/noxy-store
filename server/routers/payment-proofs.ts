import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createPaymentProof,
  getPaymentProofByOrderId,
  getPaymentProofById,
  getPendingPaymentProofs,
  getAllPaymentProofs,
  approvePaymentProof,
  rejectPaymentProof,
} from "../db.payment-proofs";
import { getOrderById, updateOrderStatus } from "../db";
import { protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

export const paymentProofsRouter = router({
  // Cliente: upload de comprovante (com base64 do arquivo)
  upload: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        base64: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se o pedido pertence ao usuário
      const order = await getOrderById(input.orderId);
      if (!order || order.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Pedido não encontrado" });
      }

      // Verificar se já existe comprovante para este pedido
      const existing = await getPaymentProofByOrderId(input.orderId);
      if (existing) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Comprovante já foi enviado para este pedido" });
      }

      // Converter base64 para Buffer
      const buffer = Buffer.from(input.base64, "base64");

      // Determinar tipo de arquivo
      const proofType = input.mimeType.startsWith("image/") ? "image" : "pdf";

      // Upload para S3
      const { url: proofUrl } = await storagePut(
        `payment-proofs/order-${input.orderId}-${Date.now()}`,
        buffer,
        input.mimeType
      );

      const proofId = await createPaymentProof({
        orderId: input.orderId,
        userId: ctx.user.id,
        proofUrl,
        proofType,
        status: "pending",
      });

      return { proofId, status: "pending" };
    }),

  // Cliente: verificar status do comprovante
  myProof: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const order = await getOrderById(input.orderId);
      if (!order || order.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Pedido não encontrado" });
      }

      const proof = await getPaymentProofByOrderId(input.orderId);
      if (!proof) {
        return null;
      }

      return {
        id: proof.id,
        status: proof.status,
        proofUrl: proof.proofUrl,
        adminNotes: proof.adminNotes,
        reviewedAt: proof.reviewedAt,
      };
    }),

  // Admin: listar comprovantes pendentes
  pendingList: adminProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return getPendingPaymentProofs(input?.limit ?? 50, input?.offset ?? 0);
    }),

  // Admin: listar todos os comprovantes
  allList: adminProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return getAllPaymentProofs(input?.limit ?? 50, input?.offset ?? 0);
    }),

  // Admin: obter detalhes do comprovante
  detail: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const proof = await getPaymentProofById(input.id);
      if (!proof) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comprovante não encontrado" });
      }
      return proof;
    }),

  // Admin: aprovar comprovante
  approve: adminProcedure
    .input(
      z.object({
        id: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const proof = await getPaymentProofById(input.id);
      if (!proof) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comprovante não encontrado" });
      }

      await approvePaymentProof(input.id, ctx.user.id, input.notes);
      
      // Atualizar status do pedido para "paid"
      const order = await getOrderById(proof.orderId);
      if (order) {
        await updateOrderStatus(proof.orderId, "paid");
      }
      
      return { success: true, status: "approved" };
    }),

  // Admin: rejeitar comprovante
  reject: adminProcedure
    .input(
      z.object({
        id: z.number(),
        notes: z.string().min(1, "Motivo da rejeição é obrigatório"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const proof = await getPaymentProofById(input.id);
      if (!proof) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comprovante não encontrado" });
      }

      await rejectPaymentProof(input.id, ctx.user.id, input.notes);
      return { success: true, status: "rejected" };
    }),
});

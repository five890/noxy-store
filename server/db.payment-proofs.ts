import { eq, and } from "drizzle-orm";
import { paymentProofs } from "../drizzle/schema";
import type { InsertPaymentProof } from "../drizzle/schema";
import { getDb } from "./db";

export async function createPaymentProof(data: InsertPaymentProof) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(paymentProofs).values(data);
  return result[0];
}

export async function getPaymentProofByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(paymentProofs)
    .where(eq(paymentProofs.orderId, orderId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getPaymentProofById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(paymentProofs)
    .where(eq(paymentProofs.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getPendingPaymentProofs(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const items = await db
    .select()
    .from(paymentProofs)
    .where(eq(paymentProofs.status, "pending"))
    .orderBy(paymentProofs.createdAt)
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: paymentProofs.id })
    .from(paymentProofs)
    .where(eq(paymentProofs.status, "pending"));

  return {
    items,
    total: countResult.length,
  };
}

export async function getAllPaymentProofs(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const items = await db
    .select()
    .from(paymentProofs)
    .orderBy(paymentProofs.createdAt)
    .limit(limit)
    .offset(offset);

  const countResult = await db.select({ count: paymentProofs.id }).from(paymentProofs);

  return {
    items,
    total: countResult.length,
  };
}

export async function approvePaymentProof(id: number, adminId: number, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(paymentProofs)
    .set({
      status: "approved",
      adminNotes: notes,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    })
    .where(eq(paymentProofs.id, id));
}

export async function rejectPaymentProof(id: number, adminId: number, notes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(paymentProofs)
    .set({
      status: "rejected",
      adminNotes: notes,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    })
    .where(eq(paymentProofs.id, id));
}

export async function updatePaymentProofStatus(id: number, status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(paymentProofs)
    .set({ status })
    .where(eq(paymentProofs.id, id));
}

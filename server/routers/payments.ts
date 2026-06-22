import Stripe from "stripe";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getCartItems, updateOrderStatus } from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-05-27.dahlia",
});

export const paymentsRouter = router({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        customerName: z.string(),
        customerEmail: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cartItems = await getCartItems(ctx.user.id);

      if (cartItems.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Carrinho vazio" });
      }

      const lineItems = cartItems.map((item) => ({
        price_data: {
          currency: "brl",
          product_data: {
            name: item.productName ?? "Produto",
            images: item.productCoverImageUrl ? [item.productCoverImageUrl] : [],
          },
          unit_amount: Math.round(Number(item.productPrice) * 100),
        },
        quantity: item.quantity,
      }));

      const origin = ctx.req.headers.origin ?? "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        customer_email: input.customerEmail,
        allow_promotion_codes: true,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          order_id: input.orderId.toString(),
          customer_email: input.customerEmail,
          customer_name: input.customerName,
        },
        success_url: `${origin}/pedido-confirmado/${input.orderId}?payment=success`,
        cancel_url: `${origin}/checkout`,
      });

      return { url: session.url };
    }),
});

// Express webhook handler (registered separately in index.ts)
export async function handleStripeWebhook(req: any, res: any) {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret ?? "");
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Stripe Webhook] Event: ${event.type} | ID: ${event.id}`);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (orderId && session.payment_status === "paid") {
        await updateOrderStatus(Number(orderId), "paid");
        console.log(`[Stripe Webhook] Order ${orderId} marked as paid`);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.order_id;
      if (orderId) {
        await updateOrderStatus(Number(orderId), "cancelled");
      }
    }
  } catch (err) {
    console.error("[Stripe Webhook] Processing error:", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }

  res.json({ received: true });
}

import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import { CheckCircle, ArrowRight, Package } from "lucide-react";

export default function OrderConfirmed() {
  const [, params] = useRoute("/pedido-confirmado/:id");
  const orderId = Number(params?.id ?? 0);

  const { data: order } = trpc.orders.myOrderDetail.useQuery(
    { id: orderId },
    { enabled: !!orderId }
  );

  const statusLabels: Record<string, string> = {
    pending: "Aguardando Pagamento",
    paid: "Pago",
    processing: "Em Processamento",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };

  return (
    <StoreLayout>
      <div className="container py-20 max-w-2xl mx-auto text-center">
        {/* Success icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ backgroundColor: "oklch(65% 0.15 145 / 0.15)", border: "2px solid oklch(65% 0.15 145)" }}
        >
          <CheckCircle size={40} style={{ color: "var(--color-success)" }} />
        </div>

        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, var(--color-gold))" }} />
          <span className="text-xs tracking-[0.5em] uppercase" style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}>
            Pedido Realizado
          </span>
          <div className="h-px w-16" style={{ background: "linear-gradient(90deg, var(--color-gold), transparent)" }} />
        </div>

        <h1 className="font-serif text-4xl font-bold mb-4" style={{ color: "var(--color-ivory)" }}>
          Obrigado pela sua compra!
        </h1>

        <p className="text-base mb-8" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-display)", fontStyle: "italic" }}>
          Seu pedido foi recebido com sucesso e está sendo processado.
        </p>

        {order && (
          <div
            className="p-6 border text-left mb-8 relative"
            style={{
              backgroundColor: "var(--color-charcoal)",
              borderColor: "var(--color-gold-muted)",
            }}
          >
            <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />

            <div className="flex items-center gap-3 mb-4">
              <Package size={18} style={{ color: "var(--color-gold)" }} />
              <h2 className="font-serif text-lg font-bold" style={{ color: "var(--color-ivory)" }}>
                Pedido #{order.id}
              </h2>
              <span
                className="px-2 py-0.5 text-xs tracking-wide border"
                style={{
                  color: "var(--color-gold)",
                  borderColor: "var(--color-gold-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {statusLabels[order.status] ?? order.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-sm" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--color-ivory)", fontFamily: "var(--font-sans)" }}>
                    {Number(item.totalPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
              ))}
            </div>

            <div className="h-px mb-4" style={{ backgroundColor: "var(--color-smoke)" }} />

            <div className="flex justify-between">
              <span className="font-serif text-base font-bold" style={{ color: "var(--color-ivory)" }}>Total</span>
              <span className="font-serif text-xl font-bold" style={{ color: "var(--color-gold)" }}>
                {Number(order.totalAmount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>

            {order.shippingAddress && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--color-smoke)" }}>
                <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                  Endereço de Entrega
                </p>
                <p className="text-sm" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                  {order.shippingAddress}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/minha-conta"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-xs tracking-widest uppercase font-semibold border transition-all hover:bg-gold/10"
            style={{
              color: "var(--color-gold)",
              borderColor: "var(--color-gold)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Meus Pedidos
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-xs tracking-widest uppercase font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-obsidian)",
              fontFamily: "var(--font-sans)",
              boxShadow: "var(--shadow-gold)",
            }}
          >
            Continuar Comprando <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </StoreLayout>
  );
}

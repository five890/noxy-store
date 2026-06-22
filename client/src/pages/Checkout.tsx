import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import StoreLayout from "@/components/StoreLayout";
import { ArrowRight, CreditCard, Lock, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Checkout() {
  const { isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({
    customerName: user?.name ?? "",
    customerEmail: user?.email ?? "",
    shippingAddress: "",
  });

  const { data: cart } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createOrder = trpc.orders.createFromCart.useMutation();
  const createCheckout = trpc.payments.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecionando para o pagamento...");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao iniciar pagamento");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerEmail || !form.shippingAddress) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const { orderId } = await createOrder.mutateAsync(form);
      await createCheckout.mutateAsync({
        orderId,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
      });
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar pedido");
    }
  };

  const isLoading = createOrder.isPending || createCheckout.isPending;

  if (!isAuthenticated) {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <h1 className="font-serif text-3xl mb-4" style={{ color: "var(--color-ivory)" }}>
            Faça login para continuar
          </h1>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-3 px-8 py-4 text-xs tracking-widest uppercase font-semibold"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-obsidian)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Entrar
          </a>
        </div>
      </StoreLayout>
    );
  }

  if (!cart?.items.length) {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <ShoppingBag size={60} className="mx-auto mb-6" style={{ color: "var(--color-gold-muted)" }} />
          <h1 className="font-serif text-3xl mb-4" style={{ color: "var(--color-ivory)" }}>
            Seu carrinho está vazio
          </h1>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-3 px-8 py-4 text-xs tracking-widest uppercase font-semibold"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-obsidian)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Explorar Catálogo
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      {/* Header */}
      <section
        className="py-16 border-b"
        style={{
          backgroundColor: "var(--color-charcoal)",
          borderColor: "var(--color-gold-muted)",
        }}
      >
        <div className="container text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, var(--color-gold))" }} />
            <span className="text-xs tracking-[0.5em] uppercase" style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}>
              Finalização
            </span>
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, var(--color-gold), transparent)" }} />
          </div>
          <h1 className="font-serif text-5xl font-bold" style={{ color: "var(--color-ivory)" }}>
            Checkout
          </h1>
        </div>
      </section>

      <div className="container py-10">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Form ──────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <div
                className="p-6 border relative"
                style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
              >
                <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />

                <h2 className="font-serif text-xl font-bold mb-6" style={{ color: "var(--color-ivory)" }}>
                  Dados do Cliente
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      required
                      className="w-full px-4 py-3 text-sm outline-none border"
                      style={{ backgroundColor: "var(--color-graphite)", color: "var(--color-ivory)", borderColor: "var(--color-smoke)", fontFamily: "var(--font-sans)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      required
                      className="w-full px-4 py-3 text-sm outline-none border"
                      style={{ backgroundColor: "var(--color-graphite)", color: "var(--color-ivory)", borderColor: "var(--color-smoke)", fontFamily: "var(--font-sans)" }}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div
                className="p-6 border relative"
                style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
              >
                <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />

                <h2 className="font-serif text-xl font-bold mb-6" style={{ color: "var(--color-ivory)" }}>
                  Endereço de Entrega
                </h2>

                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                    Endereço Completo *
                  </label>
                  <textarea
                    value={form.shippingAddress}
                    onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                    required
                    rows={3}
                    placeholder="Rua, número, bairro, cidade, estado, CEP"
                    className="w-full px-4 py-3 text-sm outline-none border resize-none"
                    style={{ backgroundColor: "var(--color-graphite)", color: "var(--color-ivory)", borderColor: "var(--color-smoke)", fontFamily: "var(--font-sans)" }}
                  />
                </div>
              </div>

              {/* Payment notice */}
              <div
                className="p-4 border flex items-start gap-3"
                style={{ backgroundColor: "oklch(74% 0.14 82 / 0.05)", borderColor: "var(--color-gold-muted)" }}
              >
                <Lock size={16} style={{ color: "var(--color-gold)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}>
                    Pagamento Seguro via Stripe
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                    Ao confirmar, você será redirecionado para o ambiente seguro do Stripe para inserir seus dados de pagamento. Use o cartão <strong>4242 4242 4242 4242</strong> para testes.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Order Summary ──────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div
                className="p-6 border sticky top-24 relative"
                style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
              >
                <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />

                <h2 className="font-serif text-xl font-bold mb-6" style={{ color: "var(--color-ivory)" }}>
                  Resumo do Pedido
                </h2>

                <div className="space-y-3 mb-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-2">
                      <span className="text-sm flex-1 truncate" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="text-sm font-semibold flex-shrink-0" style={{ color: "var(--color-ivory)", fontFamily: "var(--font-sans)" }}>
                        {(Number(item.productPrice) * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="h-px mb-4" style={{ backgroundColor: "var(--color-smoke)" }} />

                <div className="flex justify-between mb-8">
                  <span className="font-serif text-lg font-bold" style={{ color: "var(--color-ivory)" }}>Total</span>
                  <span className="font-serif text-2xl font-bold" style={{ color: "var(--color-gold)" }}>
                    {cart.subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 text-xs tracking-widest uppercase font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-obsidian)",
                    fontFamily: "var(--font-sans)",
                    boxShadow: "var(--shadow-gold)",
                  }}
                >
                  <CreditCard size={16} />
                  {isLoading ? "Processando..." : "Pagar com Stripe"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </StoreLayout>
  );
}

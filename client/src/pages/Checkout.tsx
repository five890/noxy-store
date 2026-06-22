import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import StoreLayout from "@/components/StoreLayout";
import { ArrowRight, CreditCard, Lock, ShoppingBag, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "pix">("stripe");

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
      const { orderId } = await createOrder.mutateAsync({
        ...form,
        paymentMethod,
      });

      if (paymentMethod === "stripe") {
        await createCheckout.mutateAsync({
          orderId,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
        });
      } else {
        // PIX: redirecionar para página de instruções
        setLocation(`/pedido/${orderId}/pix`);
      }
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
          <ShoppingBag size={60} className="mx-auto mb-4" style={{ color: "var(--color-gold)" }} />
          <h1 className="font-serif text-3xl mb-4" style={{ color: "var(--color-ivory)" }}>
            Carrinho vazio
          </h1>
          <Link href="/catalogo" className="text-sm" style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}>
            Voltar ao catálogo
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const inputStyle = {
    backgroundColor: "var(--color-graphite)",
    color: "var(--color-ivory)",
    borderColor: "var(--color-smoke)",
    fontFamily: "var(--font-sans)",
  };

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
              Finalizar Compra
            </span>
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, var(--color-gold), transparent)" }} />
          </div>
          <h1 className="font-serif text-5xl font-bold" style={{ color: "var(--color-ivory)" }}>
            Checkout
          </h1>
        </div>
      </section>

      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Pessoais */}
              <div
                className="p-6 border relative"
                style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
              >
                <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
                <h2 className="font-serif text-xl font-bold mb-6" style={{ color: "var(--color-ivory)" }}>
                  Dados Pessoais
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      required
                      className="w-full px-4 py-3 text-sm outline-none border"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      required
                      className="w-full px-4 py-3 text-sm outline-none border"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                      Endereço de Entrega *
                    </label>
                    <textarea
                      value={form.shippingAddress}
                      onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                      required
                      rows={3}
                      className="w-full px-4 py-3 text-sm outline-none border resize-none"
                      style={inputStyle}
                      placeholder="Rua, número, complemento, cidade, estado, CEP"
                    />
                  </div>
                </div>
              </div>

              {/* Método de Pagamento */}
              <div
                className="p-6 border relative"
                style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
              >
                <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
                <h2 className="font-serif text-xl font-bold mb-6" style={{ color: "var(--color-ivory)" }}>
                  Método de Pagamento
                </h2>
                <div className="space-y-3">
                  {/* Stripe */}
                  <label
                    className="flex items-center gap-4 p-4 border cursor-pointer transition-all"
                    style={{
                      backgroundColor: paymentMethod === "stripe" ? "var(--color-graphite)" : "transparent",
                      borderColor: paymentMethod === "stripe" ? "var(--color-gold)" : "var(--color-smoke)",
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="stripe"
                      checked={paymentMethod === "stripe"}
                      onChange={(e) => setPaymentMethod(e.target.value as "stripe" | "pix")}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} style={{ color: "var(--color-gold)" }} />
                      <div>
                        <p className="font-semibold" style={{ color: "var(--color-ivory)" }}>
                          Cartão de Crédito (Stripe)
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                          Pague com segurança usando seu cartão
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* PIX */}
                  <label
                    className="flex items-center gap-4 p-4 border cursor-pointer transition-all"
                    style={{
                      backgroundColor: paymentMethod === "pix" ? "var(--color-graphite)" : "transparent",
                      borderColor: paymentMethod === "pix" ? "var(--color-gold)" : "var(--color-smoke)",
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="pix"
                      checked={paymentMethod === "pix"}
                      onChange={(e) => setPaymentMethod(e.target.value as "stripe" | "pix")}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div className="flex items-center gap-3">
                      <QrCode size={20} style={{ color: "var(--color-gold)" }} />
                      <div>
                        <p className="font-semibold" style={{ color: "var(--color-ivory)" }}>
                          PIX
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                          Transferência instantânea via PIX
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Botão Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 text-xs tracking-widest uppercase font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-obsidian)",
                  fontFamily: "var(--font-sans)",
                  boxShadow: "var(--shadow-gold)",
                }}
              >
                <Lock size={16} />
                {isLoading ? "Processando..." : "Continuar para Pagamento"}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Resumo do Pedido */}
          <div>
            <div
              className="p-6 border sticky top-24 h-fit relative"
              style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
            >
              <div className="absolute top-3 right-3 w-5 h-5 border-b border-r" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
              <h2 className="font-serif text-xl font-bold mb-6" style={{ color: "var(--color-ivory)" }}>
                Resumo do Pedido
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b" style={{ borderColor: "var(--color-smoke)" }}>
                {cart?.items.map((item) => {
                  const itemTotal = Number(item.productPrice) * item.quantity;
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                        {item.productName} x{item.quantity}
                      </span>
                      <span style={{ color: "var(--color-gold)" }}>
                        {itemTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b" style={{ borderColor: "var(--color-smoke)" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>Subtotal:</span>
                  <span style={{ color: "var(--color-ivory)" }}>
                    {Number(cart?.subtotal ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>Frete:</span>
                  <span style={{ color: "var(--color-gold)" }}>Grátis</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-serif text-lg" style={{ color: "var(--color-gold-muted)" }}>
                  Total:
                </span>
                <span className="font-serif text-2xl font-bold" style={{ color: "var(--color-gold)" }}>
                  {Number(cart?.subtotal ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

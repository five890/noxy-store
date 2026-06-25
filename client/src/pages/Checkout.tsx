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
    recipientName: user?.name ?? "",
    street: "",
    number: "",
    complement: "",
    addressType: "house" as "house" | "apartment" | "condominium" | "commercial" | "other",
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
    
    // Validação
    if (!form.customerName || !form.customerEmail) {
      toast.error("Preencha nome e email");
      return;
    }
    if (!form.recipientName || !form.street || !form.number) {
      toast.error("Preencha todos os campos de endereço");
      return;
    }

    try {
      const { orderId } = await createOrder.mutateAsync({
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        shippingAddress: `${form.street}, ${form.number}${form.complement ? `, ${form.complement}` : ""}`,
        recipientName: form.recipientName,
        street: form.street,
        number: form.number,
        complement: form.complement,
        addressType: form.addressType,
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

  const selectStyle = {
    ...inputStyle,
  };

  return (
    <StoreLayout>
      {/* Header */}
      <section
        className="py-12 md:py-16 border-b"
        style={{
          backgroundColor: "var(--color-charcoal)",
          borderColor: "var(--color-gold-muted)",
        }}
      >
        <div className="container text-center px-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px flex-1 md:w-16" style={{ background: "linear-gradient(90deg, transparent, var(--color-gold))" }} />
            <span className="text-xs tracking-[0.5em] uppercase whitespace-nowrap" style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}>
              Finalizar Compra
            </span>
            <div className="h-px flex-1 md:w-16" style={{ background: "linear-gradient(90deg, var(--color-gold), transparent)" }} />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold" style={{ color: "var(--color-ivory)" }}>
            Checkout
          </h1>
        </div>
      </section>

      <div className="container py-8 md:py-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {/* Dados Pessoais */}
              <div
                className="p-4 md:p-6 border relative"
                style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
              >
                <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
                <h2 className="font-serif text-lg md:text-xl font-bold mb-4 md:mb-6" style={{ color: "var(--color-ivory)" }}>
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
                </div>
              </div>

              {/* Endereço de Entrega */}
              <div
                className="p-4 md:p-6 border relative"
                style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
              >
                <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
                <h2 className="font-serif text-lg md:text-xl font-bold mb-4 md:mb-6" style={{ color: "var(--color-ivory)" }}>
                  Endereço de Entrega
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                      Nome do Recebedor *
                    </label>
                    <input
                      type="text"
                      value={form.recipientName}
                      onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                      required
                      className="w-full px-4 py-3 text-sm outline-none border"
                      style={inputStyle}
                      placeholder="Quem vai receber?"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                      Rua *
                    </label>
                    <input
                      type="text"
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      required
                      className="w-full px-4 py-3 text-sm outline-none border"
                      style={inputStyle}
                      placeholder="Nome da rua"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                        Número *
                      </label>
                      <input
                        type="text"
                        value={form.number}
                        onChange={(e) => setForm({ ...form, number: e.target.value })}
                        required
                        className="w-full px-4 py-3 text-sm outline-none border"
                        style={inputStyle}
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                        Tipo *
                      </label>
                      <select
                        value={form.addressType}
                        onChange={(e) => setForm({ ...form, addressType: e.target.value as any })}
                        className="w-full px-4 py-3 text-sm outline-none border"
                        style={selectStyle}
                      >
                        <option value="house">Casa</option>
                        <option value="apartment">Apartamento</option>
                        <option value="condominium">Condomínio</option>
                        <option value="commercial">Comercial</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                      Complemento (opcional)
                    </label>
                    <input
                      type="text"
                      value={form.complement}
                      onChange={(e) => setForm({ ...form, complement: e.target.value })}
                      className="w-full px-4 py-3 text-sm outline-none border"
                      style={inputStyle}
                      placeholder="Apto 101, Bloco A, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Método de Pagamento */}
              <div
                className="p-4 md:p-6 border relative"
                style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
              >
                <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
                <h2 className="font-serif text-lg md:text-xl font-bold mb-4 md:mb-6" style={{ color: "var(--color-ivory)" }}>
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
                    <div className="flex items-center gap-3 flex-1">
                      <CreditCard size={20} style={{ color: "var(--color-gold)" }} className="flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm md:text-base" style={{ color: "var(--color-ivory)" }}>
                          Cartão de Crédito
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                          Pague com segurança
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
                    <div className="flex items-center gap-3 flex-1">
                      <QrCode size={20} style={{ color: "var(--color-gold)" }} className="flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm md:text-base" style={{ color: "var(--color-ivory)" }}>
                          PIX
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                          Instantâneo e seguro
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
                className="w-full py-4 px-6 font-semibold uppercase text-sm tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-obsidian)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {isLoading ? "Processando..." : "Confirmar Pedido"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-4 p-4 md:p-6 border"
              style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
            >
              <h3 className="font-serif text-lg font-bold mb-4" style={{ color: "var(--color-ivory)" }}>
                Resumo do Pedido
              </h3>
              <div className="space-y-3 mb-6 pb-6 border-b" style={{ borderColor: "var(--color-smoke)" }}>
                {cart?.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span style={{ color: "var(--color-parchment)" }}>
                      {item.productName} x{item.quantity}
                    </span>
                    <span style={{ color: "var(--color-gold)" }}>
                      R$ {(Number(item.productPrice) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold" style={{ color: "var(--color-ivory)" }}>
                  Total
                </span>
                <span className="font-serif text-2xl font-bold" style={{ color: "var(--color-gold)" }}>
                  R$ {Number(cart?.subtotal || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: "var(--color-parchment)" }}>
                <Lock size={14} />
                <span>Pagamento seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

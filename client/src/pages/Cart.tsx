import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const { data: cart, isLoading } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const upsert = trpc.cart.upsert.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
  });

  const remove = trpc.cart.remove.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success("Item removido do carrinho");
    },
  });

  const clear = trpc.cart.clear.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success("Carrinho esvaziado");
    },
  });

  if (loading) {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <div
            className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: "var(--color-gold)" }}
          />
        </div>
      </StoreLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <ShoppingBag size={60} className="mx-auto mb-6" style={{ color: "var(--color-gold-muted)" }} />
          <h1
            className="font-serif text-3xl font-bold mb-4"
            style={{ color: "var(--color-ivory)" }}
          >
            Faça login para ver seu carrinho
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
          >
            Você precisa estar logado para adicionar produtos ao carrinho
          </p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-3 px-8 py-4 text-xs tracking-widest uppercase font-semibold"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-obsidian)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Entrar / Cadastrar
          </a>
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
            <div
              className="h-px w-16"
              style={{ background: "linear-gradient(90deg, transparent, var(--color-gold))" }}
            />
            <span
              className="text-xs tracking-[0.5em] uppercase"
              style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}
            >
              Sua Seleção
            </span>
            <div
              className="h-px w-16"
              style={{ background: "linear-gradient(90deg, var(--color-gold), transparent)" }}
            />
          </div>
          <h1
            className="font-serif text-5xl font-bold"
            style={{ color: "var(--color-ivory)" }}
          >
            Carrinho
          </h1>
        </div>
      </section>

      <div className="container py-10">
        {isLoading ? (
          <div className="text-center py-20">
            <div
              className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto"
              style={{ borderColor: "var(--color-gold)" }}
            />
          </div>
        ) : !cart?.items.length ? (
          <div className="text-center py-20">
            <ShoppingBag
              size={60}
              className="mx-auto mb-6"
              style={{ color: "var(--color-gold-muted)" }}
            />
            <h2
              className="font-serif text-3xl font-bold mb-4"
              style={{ color: "var(--color-ivory)" }}
            >
              Seu carrinho está vazio
            </h2>
            <p
              className="text-sm mb-8"
              style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
            >
              Explore nossa coleção e adicione produtos ao carrinho
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-3 px-8 py-4 text-xs tracking-widest uppercase font-semibold"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-obsidian)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Explorar Catálogo <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Cart Items ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="font-serif text-xl"
                  style={{ color: "var(--color-ivory)" }}
                >
                  {cart.items.length} {cart.items.length === 1 ? "item" : "itens"}
                </h2>
                <button
                  onClick={() => clear.mutate()}
                  disabled={clear.isPending}
                  className="text-xs tracking-widest uppercase flex items-center gap-2 transition-colors"
                  style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
                >
                  <Trash2 size={12} /> Limpar carrinho
                </button>
              </div>

              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border"
                  style={{
                    backgroundColor: "var(--color-charcoal)",
                    borderColor: "var(--color-smoke)",
                  }}
                >
                  {/* Image */}
                  <Link href={`/produto/${item.productSlug}`} className="flex-shrink-0">
                    <div
                      className="w-24 h-24 overflow-hidden"
                      style={{ backgroundColor: "var(--color-graphite)" }}
                    >
                      {item.productCoverImageUrl ? (
                        <img
                          src={item.productCoverImageUrl}
                          alt={item.productName ?? ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={24} style={{ color: "var(--color-smoke)" }} />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/produto/${item.productSlug}`}>
                      <h3
                        className="font-serif text-base font-semibold mb-1 hover:text-gold transition-colors"
                        style={{ color: "var(--color-ivory)" }}
                      >
                        {item.productName}
                      </h3>
                    </Link>
                    <p
                      className="font-serif text-lg font-bold"
                      style={{ color: "var(--color-gold)" }}
                    >
                      {Number(item.productPrice).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex flex-col items-end gap-3">
                    <button
                      onClick={() => remove.mutate({ productId: item.productId })}
                      className="transition-colors hover:text-destructive"
                      style={{ color: "var(--color-gold-muted)" }}
                    >
                      <Trash2 size={16} />
                    </button>

                    <div
                      className="flex items-center border"
                      style={{ borderColor: "var(--color-gold-muted)" }}
                    >
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            remove.mutate({ productId: item.productId });
                          } else {
                            upsert.mutate({ productId: item.productId, quantity: item.quantity - 1 });
                          }
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gold/10 transition-colors"
                        style={{ color: "var(--color-gold)" }}
                      >
                        <Minus size={12} />
                      </button>
                      <span
                        className="w-10 text-center text-sm font-semibold"
                        style={{ color: "var(--color-ivory)", fontFamily: "var(--font-sans)" }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          upsert.mutate({
                            productId: item.productId,
                            quantity: Math.min(item.productStock ?? 99, item.quantity + 1),
                          })
                        }
                        className="w-8 h-8 flex items-center justify-center hover:bg-gold/10 transition-colors"
                        style={{ color: "var(--color-gold)" }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-ivory)", fontFamily: "var(--font-sans)" }}
                    >
                      {(Number(item.productPrice) * item.quantity).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Order Summary ──────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div
                className="p-6 border sticky top-24"
                style={{
                  backgroundColor: "var(--color-charcoal)",
                  borderColor: "var(--color-gold-muted)",
                }}
              >
                {/* Corner ornaments */}
                <div
                  className="absolute top-3 left-3 w-6 h-6 border-t border-l"
                  style={{ borderColor: "var(--color-gold)", opacity: 0.5 }}
                />
                <div
                  className="absolute bottom-3 right-3 w-6 h-6 border-b border-r"
                  style={{ borderColor: "var(--color-gold)", opacity: 0.5 }}
                />

                <h2
                  className="font-serif text-xl font-bold mb-6"
                  style={{ color: "var(--color-ivory)" }}
                >
                  Resumo do Pedido
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}
                    >
                      Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} itens)
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-ivory)", fontFamily: "var(--font-sans)" }}
                    >
                      {cart.subtotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}
                    >
                      Frete
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-success)", fontFamily: "var(--font-sans)" }}
                    >
                      {cart.subtotal >= 299 ? "Grátis" : "A calcular"}
                    </span>
                  </div>
                </div>

                <div
                  className="h-px mb-6"
                  style={{ backgroundColor: "var(--color-smoke)" }}
                />

                <div className="flex justify-between mb-8">
                  <span
                    className="font-serif text-lg font-bold"
                    style={{ color: "var(--color-ivory)" }}
                  >
                    Total
                  </span>
                  <span
                    className="font-serif text-2xl font-bold"
                    style={{ color: "var(--color-gold)" }}
                  >
                    {cart.subtotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-3 py-4 text-xs tracking-widest uppercase font-semibold transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-obsidian)",
                    fontFamily: "var(--font-sans)",
                    boxShadow: "var(--shadow-gold)",
                  }}
                >
                  Finalizar Compra <ArrowRight size={14} />
                </Link>

                <Link
                  href="/catalogo"
                  className="w-full flex items-center justify-center gap-3 py-3 mt-3 text-xs tracking-widest uppercase font-semibold border transition-colors hover:bg-gold/10"
                  style={{
                    color: "var(--color-gold)",
                    borderColor: "var(--color-gold-muted)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}

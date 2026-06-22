import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import { Package, User, LogOut, ChevronRight } from "lucide-react";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Aguardando", color: "var(--color-warning)" },
  paid: { label: "Pago", color: "var(--color-success)" },
  processing: { label: "Processando", color: "var(--color-gold)" },
  shipped: { label: "Enviado", color: "var(--color-gold-light)" },
  delivered: { label: "Entregue", color: "var(--color-success)" },
  cancelled: { label: "Cancelado", color: "var(--color-destructive)" },
};

export default function MyAccount() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: "var(--color-gold)" }} />
        </div>
      </StoreLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <User size={60} className="mx-auto mb-6" style={{ color: "var(--color-gold-muted)" }} />
          <h1 className="font-serif text-3xl font-bold mb-4" style={{ color: "var(--color-ivory)" }}>
            Minha Conta
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
            Faça login para acessar sua conta e histórico de pedidos
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
        style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
      >
        <div className="container text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, var(--color-gold))" }} />
            <span className="text-xs tracking-[0.5em] uppercase" style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}>
              Área Pessoal
            </span>
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, var(--color-gold), transparent)" }} />
          </div>
          <h1 className="font-serif text-5xl font-bold" style={{ color: "var(--color-ivory)" }}>
            Minha Conta
          </h1>
        </div>
      </section>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Profile Card ─────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div
              className="p-6 border relative"
              style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
            >
              <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />

              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "var(--color-graphite)", border: "2px solid var(--color-gold-muted)" }}
              >
                <User size={28} style={{ color: "var(--color-gold)" }} />
              </div>

              <h2 className="font-serif text-xl font-bold text-center mb-1" style={{ color: "var(--color-ivory)" }}>
                {user?.name ?? "Usuário"}
              </h2>
              {user?.email && (
                <p className="text-xs text-center mb-6" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                  {user.email}
                </p>
              )}

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="w-full flex items-center justify-center gap-2 py-2.5 mb-3 text-xs tracking-widest uppercase font-semibold border transition-colors hover:bg-gold/10"
                  style={{
                    color: "var(--color-gold)",
                    borderColor: "var(--color-gold)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Painel Admin
                </Link>
              )}

              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs tracking-widest uppercase font-semibold transition-colors"
                style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
              >
                <LogOut size={14} /> Sair
              </button>
            </div>
          </div>

          {/* ── Orders List ──────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: "var(--color-ivory)" }}>
              Histórico de Pedidos
            </h2>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse" style={{ backgroundColor: "var(--color-charcoal)" }} />
                ))}
              </div>
            ) : !orders?.length ? (
              <div
                className="p-10 border text-center"
                style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-smoke)" }}
              >
                <Package size={40} className="mx-auto mb-4" style={{ color: "var(--color-gold-muted)" }} />
                <p className="font-serif text-lg mb-2" style={{ color: "var(--color-ivory)" }}>
                  Nenhum pedido ainda
                </p>
                <p className="text-sm mb-6" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                  Explore nossa coleção e faça seu primeiro pedido
                </p>
                <Link
                  href="/catalogo"
                  className="inline-flex items-center gap-2 text-xs tracking-widest uppercase font-semibold"
                  style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}
                >
                  Ver Catálogo <ChevronRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const status = statusLabels[order.status] ?? { label: order.status, color: "var(--color-gold-muted)" };
                  return (
                    <Link
                      key={order.id}
                      href={`/pedido-confirmado/${order.id}`}
                      className="flex items-center justify-between p-4 border transition-all hover:border-gold-muted group"
                      style={{
                        backgroundColor: "var(--color-charcoal)",
                        borderColor: "var(--color-smoke)",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <Package size={20} style={{ color: "var(--color-gold-muted)" }} />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--color-ivory)", fontFamily: "var(--font-sans)" }}>
                            Pedido #{order.id}
                          </p>
                          <p className="text-xs" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                            {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className="px-2 py-0.5 text-xs tracking-wide border"
                          style={{ color: status.color, borderColor: status.color, fontFamily: "var(--font-sans)" }}
                        >
                          {status.label}
                        </span>
                        <span className="font-serif text-base font-bold" style={{ color: "var(--color-gold)" }}>
                          {Number(order.totalAmount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                        <ChevronRight size={16} style={{ color: "var(--color-gold-muted)" }} className="group-hover:text-gold transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

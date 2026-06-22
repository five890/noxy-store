import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import { Package, User, LogOut, ChevronRight, Calendar, Truck } from "lucide-react";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Aguardando Pagamento", color: "var(--color-warning)" },
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

      <div className="container py-16">
        {/* Perfil */}
        <div className="mb-12">
          <div
            className="p-8 border relative"
            style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
          >
            <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                  Olá,
                </p>
                <h2 className="font-serif text-3xl font-bold" style={{ color: "var(--color-ivory)" }}>
                  {user?.name || "Usuário"}
                </h2>
                <p className="text-sm mt-2" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 px-6 py-3 text-xs tracking-widest uppercase font-semibold border transition-all hover:bg-opacity-10"
                style={{
                  color: "var(--color-gold)",
                  borderColor: "var(--color-gold-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Pedidos */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <Package size={28} style={{ color: "var(--color-gold)" }} />
            <h2 className="font-serif text-3xl font-bold" style={{ color: "var(--color-ivory)" }}>
              Meus Pedidos
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: "var(--color-gold)" }} />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div
              className="p-8 border text-center"
              style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
            >
              <Package size={48} className="mx-auto mb-4 opacity-50" style={{ color: "var(--color-gold)" }} />
              <p style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                Você ainda não realizou nenhum pedido.
              </p>
              <Link href="/catalogo" className="inline-block mt-4 text-sm font-semibold" style={{ color: "var(--color-gold)" }}>
                Explorar Catálogo →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusLabels[order.status] || { label: order.status, color: "var(--color-gold)" };
                const deliveryDate = order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate) : null;
                const formattedDate = deliveryDate ? deliveryDate.toLocaleDateString("pt-BR") : "Não definida";

                return (
                  <Link key={order.id} href={`/pedido/${order.id}/comprovante`}>
                    <div
                      className="p-6 border cursor-pointer transition-all hover:border-gold relative group"
                      style={{
                        backgroundColor: "var(--color-charcoal)",
                        borderColor: "var(--color-gold-muted)",
                      }}
                    >
                      <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
                      <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        {/* Pedido ID */}
                        <div>
                          <p className="text-xs uppercase mb-1" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                            Pedido
                          </p>
                          <p className="font-serif text-lg font-bold" style={{ color: "var(--color-ivory)" }}>
                            #{order.id}
                          </p>
                        </div>

                        {/* Data */}
                        <div>
                          <p className="text-xs uppercase mb-1" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                            Data
                          </p>
                          <p className="text-sm" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                            {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>

                        {/* Valor */}
                        <div>
                          <p className="text-xs uppercase mb-1" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                            Total
                          </p>
                          <p className="font-semibold text-lg" style={{ color: "var(--color-gold)" }}>
                            {Number(order.totalAmount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        </div>

                        {/* Status e Entrega */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs uppercase mb-1" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                              Status
                            </p>
                            <div
                              className="inline-block px-3 py-1 text-xs font-semibold rounded"
                              style={{
                                backgroundColor: status.color + "20",
                                color: status.color,
                                fontFamily: "var(--font-sans)",
                              }}
                            >
                              {status.label}
                            </div>
                          </div>

                          {/* Data de Entrega */}
                          {order.estimatedDeliveryDate && (
                            <div className="flex items-center gap-2">
                              <Truck size={14} style={{ color: "var(--color-gold)" }} />
                              <span className="text-xs" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                                Entrega: <strong>{formattedDate}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hover indicator */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={20} style={{ color: "var(--color-gold)" }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}

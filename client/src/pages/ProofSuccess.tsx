import { useParams, useLocation } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import { CheckCircle, ArrowRight, X } from "lucide-react";

export default function ProofSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, navigate] = useLocation();

  return (
    <StoreLayout>
      <section
        className="min-h-screen flex items-center justify-center py-20"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="container max-w-2xl">
          <div className="text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <div
                className="relative w-24 h-24 flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: "var(--color-charcoal)",
                  border: "2px solid var(--color-purple)",
                  boxShadow: "0 0 30px oklch(65% 0.25 280 / 0.4)",
                }}
              >
                <CheckCircle size={60} style={{ color: "var(--color-purple)" }} />
              </div>
            </div>

            {/* Main Message */}
            <h1
              className="font-serif text-5xl md:text-6xl font-black mb-4"
              style={{ color: "var(--color-white-led)" }}
            >
              Comprovante Enviado!
            </h1>

            {/* Description */}
            <p
              className="text-lg md:text-xl mb-8 leading-relaxed"
              style={{ color: "var(--color-white-soft)" }}
            >
              Seu comprovante foi enviado com sucesso. Aguarde a empresa confirmar seu pedido.
            </p>

            {/* Order ID */}
            <div
              className="p-6 rounded-lg mb-12 inline-block"
              style={{ backgroundColor: "var(--color-charcoal)" }}
            >
              <p style={{ color: "var(--color-purple-muted)" }} className="text-sm mb-2">
                Número do Pedido
              </p>
              <p
                className="font-serif text-3xl font-bold"
                style={{ color: "var(--color-white-led)" }}
              >
                #{orderId}
              </p>
            </div>

            {/* Info Box */}
            <div
              className="p-6 rounded-lg mb-12"
              style={{
                backgroundColor: "var(--color-charcoal)",
                borderLeft: "4px solid var(--color-purple)",
              }}
            >
              <p style={{ color: "var(--color-white-soft)" }} className="text-sm leading-relaxed">
                ✓ Seu comprovante foi recebido e está em análise<br />
                ✓ Você receberá uma notificação quando for aprovado<br />
                ✓ Acompanhe o status do seu pedido na seção "Meus Pedidos"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/meus-pedidos")}
                className="px-8 py-4 text-sm tracking-widest uppercase font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--color-purple)",
                  color: "var(--color-white-led)",
                  boxShadow: "0 0 20px oklch(65% 0.25 280 / 0.4)",
                }}
              >
                Ir para Meus Pedidos
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-8 py-4 text-sm tracking-widest uppercase font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--color-purple)",
                  border: "2px solid var(--color-purple)",
                }}
              >
                Fechar
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}

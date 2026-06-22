import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import StoreLayout from "@/components/StoreLayout";
import { CheckCircle, XCircle, Eye, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminPaymentProofs() {
  const { user } = useAuth();
  const [selectedProof, setSelectedProof] = useState<number | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");

  const { data: proofs, isLoading, refetch } = trpc.paymentProofs.pendingList.useQuery(
    { limit: 50, offset: 0 },
    { enabled: user?.role === "admin" }
  );

  const { data: selectedProofData } = trpc.paymentProofs.detail.useQuery(
    { id: selectedProof! },
    { enabled: !!selectedProof }
  );

  const approve = trpc.paymentProofs.approve.useMutation({
    onSuccess: () => {
      toast.success("Comprovante aprovado!");
      setSelectedProof(null);
      setApprovalNotes("");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao aprovar");
    },
  });

  const reject = trpc.paymentProofs.reject.useMutation({
    onSuccess: () => {
      toast.success("Comprovante rejeitado!");
      setSelectedProof(null);
      setRejectionNotes("");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao rejeitar");
    },
  });

  if (user?.role !== "admin") {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <h1 className="font-serif text-3xl" style={{ color: "var(--color-ivory)" }}>
            Acesso Negado
          </h1>
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
              Administração
            </span>
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, var(--color-gold), transparent)" }} />
          </div>
          <h1 className="font-serif text-5xl font-bold" style={{ color: "var(--color-ivory)" }}>
            Análise de Comprovantes
          </h1>
        </div>
      </section>

      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Comprovantes */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 size={40} className="mx-auto animate-spin" style={{ color: "var(--color-gold)" }} />
              </div>
            ) : !proofs?.items.length ? (
              <div
                className="p-8 border text-center"
                style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
              >
                <p style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                  Nenhum comprovante pendente no momento.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {proofs.items.map((proof) => (
                  <div
                    key={proof.id}
                    onClick={() => setSelectedProof(proof.id)}
                    className="p-4 border cursor-pointer transition-all hover:border-gold"
                    style={{
                      backgroundColor: selectedProof === proof.id ? "var(--color-graphite)" : "var(--color-charcoal)",
                      borderColor: selectedProof === proof.id ? "var(--color-gold)" : "var(--color-gold-muted)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1" style={{ color: "var(--color-ivory)" }}>
                          Pedido #{proof.orderId}
                        </h3>
                        <p className="text-sm" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                          Usuário: {proof.userId}
                        </p>
                        <p className="text-xs mt-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                          {new Date(proof.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye size={18} style={{ color: "var(--color-gold)" }} />
                        <span className="text-xs uppercase font-semibold" style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}>
                          {proof.proofType}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes e Ações */}
          {selectedProofData && (
            <div
              className="p-6 border sticky top-24 h-fit"
              style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
            >
              <h2 className="font-serif text-xl font-bold mb-6" style={{ color: "var(--color-ivory)" }}>
                Detalhes
              </h2>

              {/* Preview do Comprovante */}
              <div className="mb-6">
                {selectedProofData.proofType === "image" ? (
                  <img
                    src={selectedProofData.proofUrl}
                    alt="Comprovante"
                    className="w-full rounded border"
                    style={{ borderColor: "var(--color-gold-muted)" }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center h-40 rounded border"
                    style={{ backgroundColor: "var(--color-graphite)", borderColor: "var(--color-gold-muted)" }}
                  >
                    <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}>PDF - Clique para abrir</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-3 mb-6 pb-6 border-b" style={{ borderColor: "var(--color-smoke)" }}>
                <div>
                  <span className="text-xs uppercase" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                    Pedido
                  </span>
                  <p style={{ color: "var(--color-ivory)" }}>#{selectedProofData.orderId}</p>
                </div>
                <div>
                  <span className="text-xs uppercase" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                    Tipo
                  </span>
                  <p style={{ color: "var(--color-ivory)" }}>{selectedProofData.proofType.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-xs uppercase" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                    Enviado em
                  </span>
                  <p style={{ color: "var(--color-ivory)" }}>
                    {new Date(selectedProofData.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="space-y-3">
                {/* Aprovar */}
                <div>
                  <label className="block text-xs uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                    Notas (opcional)
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Notas sobre a aprovação..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm outline-none border resize-none"
                    style={{ backgroundColor: "var(--color-graphite)", color: "var(--color-ivory)", borderColor: "var(--color-smoke)", fontFamily: "var(--font-sans)" }}
                  />
                </div>

                <button
                  onClick={() =>
                    approve.mutate({
                      id: selectedProofData.id,
                      notes: approvalNotes || undefined,
                    })
                  }
                  disabled={approve.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 text-xs tracking-widest uppercase font-semibold transition-all"
                  style={{
                    backgroundColor: "var(--color-success)",
                    color: "white",
                    fontFamily: "var(--font-sans)",
                    opacity: approve.isPending ? 0.6 : 1,
                  }}
                >
                  <CheckCircle size={16} />
                  {approve.isPending ? "Aprovando..." : "Aprovar"}
                </button>

                {/* Rejeitar */}
                <div>
                  <label className="block text-xs uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                    Motivo da Rejeição *
                  </label>
                  <textarea
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="Explique por que está rejeitando..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm outline-none border resize-none"
                    style={{ backgroundColor: "var(--color-graphite)", color: "var(--color-ivory)", borderColor: "var(--color-smoke)", fontFamily: "var(--font-sans)" }}
                  />
                </div>

                <button
                  onClick={() =>
                    reject.mutate({
                      id: selectedProofData.id,
                      notes: rejectionNotes,
                    })
                  }
                  disabled={!rejectionNotes || reject.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 text-xs tracking-widest uppercase font-semibold transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--color-destructive)",
                    color: "white",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <XCircle size={16} />
                  {reject.isPending ? "Rejeitando..." : "Rejeitar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}

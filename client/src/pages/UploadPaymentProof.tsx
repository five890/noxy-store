import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import StoreLayout from "@/components/StoreLayout";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UploadPaymentProof() {
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated, user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const { data: order } = trpc.orders.myOrderDetail.useQuery(
    { id: Number(orderId) },
    { enabled: isAuthenticated && !!orderId }
  );

  const { data: proof } = trpc.paymentProofs.myProof.useQuery(
    { orderId: Number(orderId) },
    { enabled: isAuthenticated && !!orderId }
  );

  const [, navigate] = useLocation();

  const uploadProof = trpc.paymentProofs.upload.useMutation({
    onSuccess: () => {
      navigate(`/pedido/${orderId}/comprovante-enviado`);
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao enviar comprovante");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Aceita-se apenas JPG, PNG, WebP ou PDF");
      return;
    }

    // Validar tamanho (máx 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Arquivo não pode exceder 10MB");
      return;
    }

    setFile(selectedFile);

    // Preview para imagens
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(""); // PDF não tem preview
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Selecione um arquivo");
      return;
    }

    setUploading(true);
    try {
      // Converter arquivo para base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          resolve(result.split(",")[1] ?? "");
        };
        reader.readAsDataURL(file);
      });

      await uploadProof.mutateAsync({
        orderId: Number(orderId),
        base64,
        filename: file.name,
        mimeType: file.type,
      });
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <h1 className="font-serif text-3xl mb-4" style={{ color: "var(--color-ivory)" }}>
            Faça login para continuar
          </h1>
        </div>
      </StoreLayout>
    );
  }

  if (!order) {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <AlertCircle size={60} className="mx-auto mb-4" style={{ color: "var(--color-gold)" }} />
          <h1 className="font-serif text-3xl mb-4" style={{ color: "var(--color-ivory)" }}>
            Pedido não encontrado
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
              Comprovante de Pagamento
            </span>
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, var(--color-gold), transparent)" }} />
          </div>
          <h1 className="font-serif text-5xl font-bold" style={{ color: "var(--color-ivory)" }}>
            Enviar Comprovante
          </h1>
        </div>
      </section>

      <div className="container py-16">
        <div className="max-w-2xl mx-auto">
          {/* Pedido Info */}
          <div
            className="p-6 border mb-8 relative"
            style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
          >
            <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />

            <h2 className="font-serif text-xl font-bold mb-4" style={{ color: "var(--color-ivory)" }}>
              Pedido #{order.id}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
              <div>
                <span style={{ color: "var(--color-gold-muted)" }}>Total:</span>
                <p className="font-semibold" style={{ color: "var(--color-ivory)" }}>
                  {Number(order.totalAmount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
              <div>
                <span style={{ color: "var(--color-gold-muted)" }}>Status:</span>
                <p className="font-semibold" style={{ color: "var(--color-gold)" }}>
                  {order.status.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Status do Comprovante */}
          {proof && (
            <div
              className="p-6 border mb-8 relative"
              style={{
                backgroundColor: proof.status === "approved" ? "oklch(65% 0.15 145 / 0.05)" : "oklch(55% 0.22 25 / 0.05)",
                borderColor: proof.status === "approved" ? "var(--color-success)" : "var(--color-destructive)",
              }}
            >
              <div className="flex items-start gap-4">
                {proof.status === "approved" ? (
                  <CheckCircle size={24} style={{ color: "var(--color-success)", flexShrink: 0 }} />
                ) : proof.status === "rejected" ? (
                  <AlertCircle size={24} style={{ color: "var(--color-destructive)", flexShrink: 0 }} />
                ) : (
                  <Loader2 size={24} className="animate-spin" style={{ color: "var(--color-gold)", flexShrink: 0 }} />
                )}
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "var(--color-ivory)" }}>
                    {proof.status === "approved" ? "Comprovante Aprovado ✓" : proof.status === "rejected" ? "Comprovante Rejeitado" : "Comprovante em Análise"}
                  </h3>
                  {proof.adminNotes && (
                    <p className="text-sm" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
                      {proof.adminNotes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upload Form */}
          {!proof || proof.status === "rejected" ? (
            <form onSubmit={handleSubmit}>
              <div
                className="p-8 border-2 border-dashed rounded text-center relative"
                style={{ backgroundColor: "var(--color-graphite)", borderColor: "var(--color-gold-muted)" }}
              >
                <input
                  type="file"
                  id="proof-file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                  disabled={uploading}
                />

                {preview ? (
                  <div className="mb-6">
                    {file?.type.startsWith("image/") ? (
                      <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
                    ) : (
                      <div className="flex items-center justify-center h-64 bg-black/30 rounded">
                        <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}>PDF Selecionado</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <Upload size={48} className="mx-auto mb-4" style={{ color: "var(--color-gold)" }} />
                )}

                <label
                  htmlFor="proof-file"
                  className="inline-block px-6 py-3 mb-4 text-xs tracking-widest uppercase font-semibold cursor-pointer transition-all"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-obsidian)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {file ? "Alterar Arquivo" : "Selecionar Arquivo"}
                </label>

                <p className="text-xs mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                  JPG, PNG, WebP ou PDF • Máximo 10MB
                </p>

                {file && (
                  <p className="text-sm font-semibold" style={{ color: "var(--color-ivory)", fontFamily: "var(--font-sans)" }}>
                    {file.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full mt-6 flex items-center justify-center gap-3 py-4 text-xs tracking-widest uppercase font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-obsidian)",
                  fontFamily: "var(--font-sans)",
                  boxShadow: "var(--shadow-gold)",
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Enviar Comprovante
                  </>
                )}
              </button>
            </form>
          ) : null}

          {/* Info Box */}
          <div
            className="mt-8 p-4 border"
            style={{ backgroundColor: "oklch(74% 0.14 82 / 0.05)", borderColor: "var(--color-gold-muted)" }}
          >
            <p className="text-xs" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>
              <strong style={{ color: "var(--color-gold)" }}>ℹ Informações:</strong> Envie uma foto ou PDF do comprovante de pagamento. O administrador analisará e aprovará sua solicitação. Após aprovação, seu pedido será preparado para entrega.
            </p>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

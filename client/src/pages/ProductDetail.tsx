import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useRoute, Link } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import { ShoppingBag, ArrowLeft, Tag, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const [, params] = useRoute("/produto/:slug");
  const slug = params?.slug ?? "";
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = trpc.products.bySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const addToCart = trpc.cart.upsert.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success("Produto adicionado ao carrinho!", {
        style: {
          backgroundColor: "var(--color-charcoal)",
          color: "var(--color-ivory)",
          border: "1px solid var(--color-gold-muted)",
        },
      });
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    addToCart.mutate({ productId: product!.id, quantity });
  };

  const allImages = product
    ? [
        ...(product.coverImageUrl ? [{ url: product.coverImageUrl, altText: product.name }] : []),
        ...(product.images ?? []),
      ]
    : [];

  const price = product ? Number(product.price) : 0;
  const compareAtPrice = product?.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discount =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div
              className="aspect-square animate-pulse"
              style={{ backgroundColor: "var(--color-charcoal)" }}
            />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse"
                  style={{ backgroundColor: "var(--color-charcoal)", width: `${80 - i * 10}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <h1
            className="font-serif text-3xl mb-4"
            style={{ color: "var(--color-ivory)" }}
          >
            Produto não encontrado
          </h1>
          <Link
            href="/catalogo"
            className="text-xs tracking-widest uppercase"
            style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}
          >
            Voltar ao catálogo
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container py-10">
        {/* Breadcrumb */}
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase mb-8 transition-colors"
          style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
        >
          <ArrowLeft size={12} /> Voltar ao catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ── Image Gallery ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              className="relative aspect-square overflow-hidden"
              style={{ backgroundColor: "var(--color-charcoal)" }}
            >
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]?.url}
                  alt={allImages[selectedImage]?.altText ?? product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={60} style={{ color: "var(--color-smoke)" }} />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.onSale && discount && (
                  <span
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold tracking-wide"
                    style={{
                      backgroundColor: "var(--color-gold)",
                      color: "var(--color-obsidian)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    <Tag size={12} /> -{discount}%
                  </span>
                )}
              </div>

              {/* Navigation arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: "oklch(8% 0 0 / 0.7)",
                      color: "var(--color-gold)",
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: "oklch(8% 0 0 / 0.7)",
                      color: "var(--color-gold)",
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Corner ornaments */}
              <div
                className="absolute top-3 left-3 w-6 h-6 border-t border-l"
                style={{ borderColor: "var(--color-gold)", opacity: 0.5 }}
              />
              <div
                className="absolute bottom-3 right-3 w-6 h-6 border-b border-r"
                style={{ borderColor: "var(--color-gold)", opacity: 0.5 }}
              />
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-all"
                    style={{
                      borderColor: selectedImage === i ? "var(--color-gold)" : "transparent",
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.altText ?? `Imagem ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ──────────────────────────────────────────── */}
          <div className="flex flex-col">
            {/* Category */}
            {/* Title */}
            <h1
              className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight"
              style={{ color: "var(--color-ivory)" }}
            >
              {product.name}
            </h1>

            {/* Divider */}
            <div
              className="h-px mb-6"
              style={{
                background: "linear-gradient(90deg, var(--color-gold), transparent)",
              }}
            />

            {/* Price */}
            <div className="flex items-end gap-4 mb-6">
              <span
                className="font-serif text-4xl font-bold"
                style={{ color: "var(--color-gold)" }}
              >
                {price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <div className="flex flex-col">
                  <span
                    className="text-lg line-through"
                    style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
                  >
                    {compareAtPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                  <span
                    className="text-xs tracking-wide"
                    style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}
                  >
                    Economia de {discount}%
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <p
                  className="text-base leading-relaxed"
                  style={{
                    color: "var(--color-parchment)",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                  }}
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* Stock */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <p
                  className="text-xs tracking-widest uppercase"
                  style={{ color: "var(--color-success)", fontFamily: "var(--font-sans)" }}
                >
                  ✓ Em estoque ({product.stock} {product.stock === 1 ? "unidade" : "unidades"})
                </p>
              ) : (
                <p
                  className="text-xs tracking-widest uppercase"
                  style={{ color: "var(--color-destructive)", fontFamily: "var(--font-sans)" }}
                >
                  ✗ Produto esgotado
                </p>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span
                    className="text-xs tracking-widest uppercase"
                    style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
                  >
                    Quantidade
                  </span>
                  <div
                    className="flex items-center border"
                    style={{ borderColor: "var(--color-gold-muted)" }}
                  >
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-gold/10"
                      style={{ color: "var(--color-gold)" }}
                    >
                      <Minus size={14} />
                    </button>
                    <span
                      className="w-12 text-center text-sm font-semibold"
                      style={{ color: "var(--color-ivory)", fontFamily: "var(--font-sans)" }}
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-gold/10"
                      style={{ color: "var(--color-gold)" }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending}
                  className="w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest uppercase font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-obsidian)",
                    fontFamily: "var(--font-sans)",
                    boxShadow: "var(--shadow-gold)",
                  }}
                >
                  <ShoppingBag size={18} />
                  {addToCart.isPending ? "Adicionando..." : "Adicionar ao Carrinho"}
                </button>

                <Link
                  href="/carrinho"
                  className="w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest uppercase font-semibold border transition-all duration-300 hover:bg-gold/10"
                  style={{
                    color: "var(--color-gold)",
                    borderColor: "var(--color-gold)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Ver Carrinho
                </Link>
              </div>
            )}

            {/* Tags */}
            {product.tags && (product.tags as string[]).length > 0 && (
              <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--color-smoke)" }}>
                <p
                  className="text-xs tracking-widest uppercase mb-3"
                  style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
                >
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {(product.tags as string[]).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs tracking-wide border"
                      style={{
                        color: "var(--color-parchment)",
                        borderColor: "var(--color-smoke)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

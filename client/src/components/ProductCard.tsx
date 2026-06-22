import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ShoppingBag, Tag } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  compareAtPrice?: string | null;
  coverImageUrl?: string | null;
  onSale?: boolean;
  featured?: boolean;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const addToCart = trpc.cart.upsert.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success("Produto adicionado ao carrinho", {
        style: {
          backgroundColor: "var(--color-charcoal)",
          color: "var(--color-white-led)",
          border: "1px solid var(--color-purple-muted)",
        },
      });
    },
    onError: () => {
      toast.error("Erro ao adicionar ao carrinho");
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  const price = Number(product.price);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discount =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 border"
      style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-purple-muted)" }}
    >
      {/* Image container */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{ backgroundColor: "var(--color-graphite)" }}
      >
        {product.coverImageUrl ? (
          <img
            src={product.coverImageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={40} style={{ color: "var(--color-smoke)" }} />
          </div>
        )}

        {/* Overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          style={{ backgroundColor: "oklch(8% 0 0 / 0.5)" }}
        >
          <button
            onClick={handleAddToCart}
            disabled={addToCart.isPending || product.stock === 0}
            className="flex items-center gap-2 px-5 py-3 text-xs tracking-widest uppercase font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-obsidian)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <ShoppingBag size={14} />
            {product.stock === 0 ? "Esgotado" : "Adicionar"}
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.onSale && discount && (
            <span
              className="flex items-center gap-1 px-2 py-1 text-xs font-bold tracking-wide"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-obsidian)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <Tag size={10} />
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span
              className="px-2 py-1 text-xs font-semibold tracking-widest uppercase"
              style={{
                backgroundColor: "var(--color-obsidian)",
                color: "var(--color-gold)",
                border: "1px solid var(--color-gold-muted)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Destaque
            </span>
          )}
        </div>

        {/* Corner ornaments */}
        <div
          className="absolute top-2 right-2 w-5 h-5 border-t border-r opacity-0 group-hover:opacity-60 transition-opacity duration-300"
          style={{ borderColor: "var(--color-gold)" }}
        />
        <div
          className="absolute bottom-2 left-2 w-5 h-5 border-b border-l opacity-0 group-hover:opacity-60 transition-opacity duration-300"
          style={{ borderColor: "var(--color-gold)" }}
        />
      </div>

      {/* Product info */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-serif text-base font-semibold mb-2 line-clamp-2 group-hover:text-gold transition-colors"
          style={{ color: "var(--color-ivory)", lineHeight: 1.3 }}
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mt-auto">
          <span
            className="font-serif text-lg font-bold"
            style={{ color: "var(--color-gold)" }}
          >
            {price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span
              className="text-sm line-through"
              style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
            >
              {compareAtPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          )}
        </div>

        {product.stock === 0 && (
          <p
            className="text-xs mt-1 tracking-wide"
            style={{ color: "var(--color-destructive)", fontFamily: "var(--font-sans)" }}
          >
            Esgotado
          </p>
        )}
      </div>

      {/* Bottom gold accent */}
      <div
        className="h-px w-0 group-hover:w-full transition-all duration-500"
        style={{ backgroundColor: "var(--color-gold)" }}
      />
    </Link>
  );
}

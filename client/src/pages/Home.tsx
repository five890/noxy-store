import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Star, Shield, Truck, CheckCircle2, Sparkles } from "lucide-react";

export default function Home() {
  const { data: featuredCategories } = trpc.categories.featured.useQuery();
  const { data: saleProducts } = trpc.products.list.useQuery({ onSale: true, limit: 8 });
  const { data: featuredProducts } = trpc.products.list.useQuery({ featured: true, limit: 4 });

  return (
    <StoreLayout>
      {/* ── Hero Banner ────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        style={{
          background: "linear-gradient(135deg, var(--color-background) 0%, oklch(15% 0.15 280) 50%, var(--color-background) 100%)",
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Glow orbs */}
          <div
            className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{
              background: "radial-gradient(circle, oklch(65% 0.25 280), transparent)",
              animation: "pulse 8s ease-in-out infinite",
            }}
          />
          <div
            className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{
              background: "radial-gradient(circle, oklch(60% 0.20 280), transparent)",
              animation: "pulse 10s ease-in-out infinite 2s",
            }}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, oklch(65% 0.20 280 / 0.5) 25%, oklch(65% 0.20 280 / 0.5) 26%, transparent 27%, transparent 74%, oklch(65% 0.20 280 / 0.5) 75%, oklch(65% 0.20 280 / 0.5) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, oklch(65% 0.20 280 / 0.5) 25%, oklch(65% 0.20 280 / 0.5) 26%, transparent 27%, transparent 74%, oklch(65% 0.20 280 / 0.5) 75%, oklch(65% 0.20 280 / 0.5) 76%, transparent 77%, transparent)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Content */}
        <div className="container relative z-10 text-center px-4">
          {/* Top accent */}
          <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
            <Sparkles size={20} style={{ color: "var(--color-purple)" }} />
            <span
              className="text-sm tracking-widest uppercase font-semibold"
              style={{ color: "var(--color-purple)" }}
            >
              Bem-vindo à Noxy Store
            </span>
            <Sparkles size={20} style={{ color: "var(--color-purple)" }} />
          </div>

          {/* Main heading */}
          <div className="mb-8">
            <h1
              className="font-serif text-7xl md:text-8xl lg:text-9xl font-black leading-tight mb-4"
              style={{
                color: "var(--color-white-led)",
                textShadow: "0 0 40px oklch(65% 0.25 280 / 0.8), 0 0 80px oklch(65% 0.15 280 / 0.4)",
                letterSpacing: "-0.02em",
              }}
            >
              NOXY
            </h1>
            <div
              className="text-5xl md:text-6xl lg:text-7xl font-serif font-black"
              style={{
                background: "linear-gradient(135deg, var(--color-purple) 0%, var(--color-white-led) 50%, var(--color-purple) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 0 30px oklch(65% 0.20 280 / 0.5)",
              }}
            >
              STORE
            </div>
          </div>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--color-white-soft)", fontStyle: "italic" }}
          >
            Experiência de compra elevada. Produtos selecionados. Entrega em todo o Brasil.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/catalogo">
              <button
                className="px-8 py-4 text-sm tracking-widest uppercase font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--color-purple)",
                  color: "var(--color-white-led)",
                  boxShadow: "0 0 20px oklch(65% 0.25 280 / 0.4)",
                }}
              >
                Explorar Catálogo
                <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/catalogo?onSale=true">
              <button
                className="px-8 py-4 text-sm tracking-widest uppercase font-bold transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--color-purple)",
                  border: "2px solid var(--color-purple)",
                }}
              >
                Ver Promoções
              </button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 text-sm" style={{ color: "var(--color-white-soft)" }}>
            <div className="flex items-center gap-2">
              <Shield size={18} style={{ color: "var(--color-purple)" }} />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={18} style={{ color: "var(--color-purple)" }} />
              <span>Entrega Rápida</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} style={{ color: "var(--color-purple)" }} />
              <span>Garantia</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div
            className="w-6 h-10 border-2 rounded-full flex items-start justify-center p-2"
            style={{ borderColor: "var(--color-purple)" }}
          >
            <div
              className="w-1 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--color-purple)" }}
            />
          </div>
        </div>
      </section>

      {/* ── Featured Categories ────────────────────────────────────────────── */}
      {featuredCategories && Array.isArray(featuredCategories) && featuredCategories.length > 0 && (
        <section className="py-20" style={{ backgroundColor: "var(--color-background)" }}>
          <div className="container">
            <div className="text-center mb-16">
              <p
                className="text-sm tracking-widest uppercase mb-4"
                style={{ color: "var(--color-purple)" }}
              >
                Categorias
              </p>
              <h2
                className="font-serif text-5xl md:text-6xl font-black"
                style={{ color: "var(--color-white-led)" }}
              >
                Coleções em Destaque
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCategories.map((category: any) => (
                <Link key={category.id} href={`/catalogo?category=${category.id}`}>
                  <div
                    className="p-8 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{
                      backgroundColor: "var(--color-charcoal)",
                      borderLeft: "4px solid var(--color-purple)",
                    }}
                  >
                    <h3
                      className="font-serif text-2xl font-bold mb-2"
                      style={{ color: "var(--color-white-led)" }}
                    >
                      {category.name}
                    </h3>
                    <p style={{ color: "var(--color-white-soft)" }}>Explorar</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ──────────────────────────────────────────────── */}
      {featuredProducts && Array.isArray(featuredProducts) && featuredProducts.length > 0 && (
        <section className="py-20" style={{ backgroundColor: "var(--color-obsidian)" }}>
          <div className="container">
            <div className="text-center mb-16">
              <p
                className="text-sm tracking-widest uppercase mb-4"
                style={{ color: "var(--color-purple)" }}
              >
                Seleção Especial
              </p>
              <h2
                className="font-serif text-5xl md:text-6xl font-black"
                style={{ color: "var(--color-white-led)" }}
              >
                Produtos em Destaque
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Sale Products ──────────────────────────────────────────────────── */}
      {saleProducts && Array.isArray(saleProducts) && saleProducts.length > 0 && (
        <section className="py-20" style={{ backgroundColor: "var(--color-background)" }}>
          <div className="container">
            <div className="text-center mb-16">
              <div
                className="inline-block px-4 py-2 rounded-full mb-4"
                style={{ backgroundColor: "var(--color-charcoal)" }}
              >
                <p
                  className="text-sm tracking-widest uppercase font-bold"
                  style={{ color: "var(--color-purple)" }}
                >
                  ⚡ Promoção
                </p>
              </div>
              <h2
                className="font-serif text-5xl md:text-6xl font-black"
                style={{ color: "var(--color-white-led)" }}
              >
                Ofertas Especiais
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {saleProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/catalogo?onSale=true">
                <button
                  className="px-8 py-3 text-sm tracking-widest uppercase font-bold transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: "var(--color-purple)",
                    color: "var(--color-white-led)",
                  }}
                >
                  Ver Todas as Promoções
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </StoreLayout>
  );
}

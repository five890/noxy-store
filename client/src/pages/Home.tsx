import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Star, Shield, Truck } from "lucide-react";

export default function Home() {
  const { data: featuredCategories } = trpc.categories.featured.useQuery();
  const { data: saleProducts } = trpc.products.list.useQuery({ onSale: true, limit: 8 });
  const { data: featuredProducts } = trpc.products.list.useQuery({ featured: true, limit: 4 });

  return (
    <StoreLayout>
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: "var(--color-obsidian)" }}
      >
        {/* Background geometric pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                var(--color-gold) 0px,
                var(--color-gold) 1px,
                transparent 1px,
                transparent 60px
              ),
              repeating-linear-gradient(
                -45deg,
                var(--color-gold) 0px,
                var(--color-gold) 1px,
                transparent 1px,
                transparent 60px
              )
            `,
          }}
        />

        {/* Radial glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(74% 0.14 82 / 0.4), transparent)",
          }}
        />

        <div className="container relative z-10 text-center">
          {/* Ornamental lines */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div
              className="h-px flex-1 max-w-24"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--color-gold))",
              }}
            />
            <span
              className="text-xs tracking-[0.5em] uppercase"
              style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}
            >
              Coleção Exclusiva
            </span>
            <div
              className="h-px flex-1 max-w-24"
              style={{
                background:
                  "linear-gradient(90deg, var(--color-gold), transparent)",
              }}
            />
          </div>

          <h1
            className="font-serif text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-none"
            style={{ color: "var(--color-ivory)" }}
          >
            MAISON
            <br />
            <span className="text-gold-gradient" style={{
              background: "linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 40%, var(--color-gold-dark) 70%, var(--color-gold) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              DORÉE
            </span>
          </h1>

          <p
            className="font-display text-xl md:text-2xl italic mb-4"
            style={{ color: "var(--color-parchment)", fontFamily: "var(--font-display)" }}
          >
            Onde o luxo encontra a arte
          </p>

          <p
            className="text-sm tracking-widest uppercase mb-12 max-w-md mx-auto"
            style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
          >
            Curadoria refinada de produtos de alto padrão para quem aprecia o extraordinário
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-3 px-8 py-4 text-xs tracking-widest uppercase font-semibold transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-obsidian)",
                fontFamily: "var(--font-sans)",
                boxShadow: "var(--shadow-gold)",
              }}
            >
              Explorar Catálogo
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/catalogo?onSale=true"
              className="inline-flex items-center gap-3 px-8 py-4 text-xs tracking-widest uppercase font-semibold border transition-all duration-300 hover:bg-gold/10"
              style={{
                color: "var(--color-gold)",
                borderColor: "var(--color-gold)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Ver Promoções
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <div
              className="w-px h-12"
              style={{
                background: "linear-gradient(180deg, var(--color-gold), transparent)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Features Bar ─────────────────────────────────────────────────── */}
      <section
        className="border-y py-6"
        style={{
          backgroundColor: "var(--color-charcoal)",
          borderColor: "var(--color-gold-muted)",
        }}
      >
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Truck size={20} />,
                title: "Frete Grátis",
                desc: "Em compras acima de R$ 299",
              },
              {
                icon: <Shield size={20} />,
                title: "Compra Segura",
                desc: "Pagamentos criptografados",
              },
              {
                icon: <Star size={20} />,
                title: "Qualidade Premium",
                desc: "Produtos selecionados",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 justify-center md:justify-start">
                <div style={{ color: "var(--color-gold)" }}>{item.icon}</div>
                <div>
                  <p
                    className="text-xs tracking-widest uppercase font-semibold"
                    style={{ color: "var(--color-ivory)", fontFamily: "var(--font-sans)" }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Categories ───────────────────────────────────────────── */}
      {featuredCategories && featuredCategories.length > 0 && (
        <section className="py-20" style={{ backgroundColor: "var(--color-obsidian)" }}>
          <div className="container">
            {/* Section header */}
            <div className="text-center mb-12">
              <div className="deco-divider mb-6">
                <span style={{ color: "var(--color-gold)" }}>◆</span>
              </div>
              <h2
                className="font-serif text-4xl md:text-5xl font-bold mb-3"
                style={{ color: "var(--color-ivory)" }}
              >
                Categorias em Destaque
              </h2>
              <p
                className="text-sm tracking-widest uppercase"
                style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
              >
                Explore nossa curadoria exclusiva
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalogo?categoria=${cat.slug}`}
                  className="group relative overflow-hidden aspect-[4/3] flex items-end p-6 transition-all duration-500"
                  style={{ backgroundColor: "var(--color-charcoal)" }}
                >
                  {/* Background image */}
                  {cat.imageUrl && (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                    />
                  )}

                  {/* Overlay gradient */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, oklch(8% 0 0 / 0.9) 0%, transparent 60%)",
                    }}
                  />

                  {/* Corner ornaments */}
                  <div
                    className="absolute top-4 left-4 w-8 h-8 border-t border-l opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ borderColor: "var(--color-gold)" }}
                  />
                  <div
                    className="absolute bottom-4 right-4 w-8 h-8 border-b border-r opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ borderColor: "var(--color-gold)" }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <h3
                      className="font-serif text-2xl font-bold mb-1 group-hover:text-gold transition-colors"
                      style={{ color: "var(--color-ivory)" }}
                    >
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p
                        className="text-xs tracking-wide"
                        style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
                      >
                        {cat.description}
                      </p>
                    )}
                    <div
                      className="flex items-center gap-2 mt-3 text-xs tracking-widest uppercase font-semibold"
                      style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}
                    >
                      Explorar <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      {featuredProducts && featuredProducts.items.length > 0 && (
        <section
          className="py-20 border-t"
          style={{
            backgroundColor: "var(--color-charcoal)",
            borderColor: "var(--color-gold-muted)",
          }}
        >
          <div className="container">
            <div className="text-center mb-12">
              <div className="deco-divider mb-6">
                <span style={{ color: "var(--color-gold)" }}>◆</span>
              </div>
              <h2
                className="font-serif text-4xl md:text-5xl font-bold mb-3"
                style={{ color: "var(--color-ivory)" }}
              >
                Destaques da Coleção
              </h2>
              <p
                className="text-sm tracking-widest uppercase"
                style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
              >
                Peças selecionadas para você
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-3 px-8 py-3 border text-xs tracking-widest uppercase font-semibold transition-all duration-300 hover:bg-gold/10"
                style={{
                  color: "var(--color-gold)",
                  borderColor: "var(--color-gold)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Ver Toda a Coleção <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Sale Products ─────────────────────────────────────────────────── */}
      {saleProducts && saleProducts.items.length > 0 && (
        <section className="py-20" style={{ backgroundColor: "var(--color-obsidian)" }}>
          <div className="container">
            <div className="text-center mb-12">
              <div className="deco-divider mb-6">
                <span style={{ color: "var(--color-gold)" }}>◆</span>
              </div>
              <h2
                className="font-serif text-4xl md:text-5xl font-bold mb-3"
                style={{ color: "var(--color-ivory)" }}
              >
                Ofertas Especiais
              </h2>
              <p
                className="text-sm tracking-widest uppercase"
                style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
              >
                Oportunidades únicas por tempo limitado
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {saleProducts.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/catalogo?onSale=true"
                className="inline-flex items-center gap-3 px-8 py-3 text-xs tracking-widest uppercase font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-obsidian)",
                  fontFamily: "var(--font-sans)",
                  boxShadow: "var(--shadow-gold)",
                }}
              >
                Ver Todas as Promoções <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Empty State (no products yet) ────────────────────────────────── */}
      {(!saleProducts?.items.length && !featuredProducts?.items.length && !featuredCategories?.length) && (
        <section className="py-32 text-center" style={{ backgroundColor: "var(--color-obsidian)" }}>
          <div className="container">
            <div className="deco-divider mb-8">
              <span style={{ color: "var(--color-gold)" }}>◆</span>
            </div>
            <h2
              className="font-serif text-3xl font-bold mb-4"
              style={{ color: "var(--color-ivory)" }}
            >
              Loja em Preparação
            </h2>
            <p
              className="text-sm tracking-wide mb-8"
              style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
            >
              Nossa coleção exclusiva estará disponível em breve. Acesse o painel administrativo para adicionar produtos.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-3 px-8 py-3 border text-xs tracking-widest uppercase font-semibold"
              style={{
                color: "var(--color-gold)",
                borderColor: "var(--color-gold)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Painel Admin <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}
    </StoreLayout>
  );
}

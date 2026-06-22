import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import ProductCard from "@/components/ProductCard";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";

export default function Catalog() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");

  const [search, setSearch] = useState(params.get("search") ?? "");
  const [categorySlug, setCategorySlug] = useState(params.get("categoria") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [onSale, setOnSale] = useState(params.get("onSale") === "true");
  const [page, setPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const limit = 12;

  const { data: categories } = trpc.categories.list.useQuery();

  const selectedCategory = categories?.find((c) => c.slug === categorySlug);

  const { data, isLoading } = trpc.products.list.useQuery({
    categoryId: selectedCategory?.id,
    search: search || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    onSale: onSale || undefined,
    limit,
    offset: page * limit,
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const clearFilters = () => {
    setSearch("");
    setCategorySlug("");
    setMinPrice("");
    setMaxPrice("");
    setOnSale(false);
    setPage(0);
  };

  const hasFilters = search || categorySlug || minPrice || maxPrice || onSale;

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
              Nossa Coleção
            </span>
            <div
              className="h-px w-16"
              style={{ background: "linear-gradient(90deg, var(--color-gold), transparent)" }}
            />
          </div>
          <h1
            className="font-serif text-5xl md:text-6xl font-bold"
            style={{ color: "var(--color-ivory)" }}
          >
            Catálogo
          </h1>
          {data && (
            <p
              className="mt-3 text-sm tracking-wide"
              style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
            >
              {data.total} {data.total === 1 ? "produto encontrado" : "produtos encontrados"}
            </p>
          )}
        </div>
      </section>

      <div className="container py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar Filters ─────────────────────────────────────────── */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Mobile filter toggle */}
            <button
              className="lg:hidden w-full flex items-center justify-between px-4 py-3 mb-4 border text-xs tracking-widest uppercase font-semibold"
              style={{
                color: "var(--color-gold)",
                borderColor: "var(--color-gold-muted)",
                fontFamily: "var(--font-sans)",
                backgroundColor: "var(--color-charcoal)",
              }}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={14} /> Filtros
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`${filtersOpen ? "block" : "hidden"} lg:block space-y-6`}
            >
              {/* Search */}
              <div>
                <h3
                  className="text-xs tracking-widest uppercase font-semibold mb-3"
                  style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}
                >
                  Buscar
                </h3>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-gold-muted)" }}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    placeholder="Nome do produto..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm outline-none border"
                    style={{
                      backgroundColor: "var(--color-graphite)",
                      color: "var(--color-ivory)",
                      borderColor: "var(--color-smoke)",
                      fontFamily: "var(--font-sans)",
                    }}
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3
                  className="text-xs tracking-widest uppercase font-semibold mb-3"
                  style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}
                >
                  Categoria
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => { setCategorySlug(""); setPage(0); }}
                    className="w-full text-left px-3 py-2 text-sm transition-colors"
                    style={{
                      color: !categorySlug ? "var(--color-gold)" : "var(--color-parchment)",
                      backgroundColor: !categorySlug ? "var(--color-graphite)" : "transparent",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Todas as categorias
                  </button>
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setCategorySlug(cat.slug); setPage(0); }}
                      className="w-full text-left px-3 py-2 text-sm transition-colors"
                      style={{
                        color: categorySlug === cat.slug ? "var(--color-gold)" : "var(--color-parchment)",
                        backgroundColor: categorySlug === cat.slug ? "var(--color-graphite)" : "transparent",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3
                  className="text-xs tracking-widest uppercase font-semibold mb-3"
                  style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}
                >
                  Faixa de Preço
                </h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(0); }}
                    placeholder="Mín"
                    className="w-full px-3 py-2 text-sm outline-none border"
                    style={{
                      backgroundColor: "var(--color-graphite)",
                      color: "var(--color-ivory)",
                      borderColor: "var(--color-smoke)",
                      fontFamily: "var(--font-sans)",
                    }}
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(0); }}
                    placeholder="Máx"
                    className="w-full px-3 py-2 text-sm outline-none border"
                    style={{
                      backgroundColor: "var(--color-graphite)",
                      color: "var(--color-ivory)",
                      borderColor: "var(--color-smoke)",
                      fontFamily: "var(--font-sans)",
                    }}
                  />
                </div>
              </div>

              {/* On Sale */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className="relative w-10 h-5 rounded-full transition-colors"
                    style={{
                      backgroundColor: onSale ? "var(--color-gold)" : "var(--color-smoke)",
                    }}
                    onClick={() => { setOnSale(!onSale); setPage(0); }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                      style={{
                        backgroundColor: "var(--color-obsidian)",
                        transform: onSale ? "translateX(1.25rem)" : "translateX(0.125rem)",
                      }}
                    />
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}
                  >
                    Apenas promoções
                  </span>
                </label>
              </div>

              {/* Clear filters */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-xs tracking-widest uppercase font-semibold transition-colors"
                  style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
                >
                  <X size={12} /> Limpar filtros
                </button>
              )}
            </div>
          </aside>

          {/* ── Products Grid ────────────────────────────────────────────── */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] animate-pulse"
                    style={{ backgroundColor: "var(--color-charcoal)" }}
                  />
                ))}
              </div>
            ) : data?.items.length === 0 ? (
              <div className="text-center py-20">
                <p
                  className="font-serif text-2xl mb-3"
                  style={{ color: "var(--color-ivory)" }}
                >
                  Nenhum produto encontrado
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
                >
                  Tente ajustar os filtros de busca
                </p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-xs tracking-widest uppercase font-semibold"
                    style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data?.items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 text-xs tracking-widest uppercase border transition-colors disabled:opacity-30"
                      style={{
                        color: "var(--color-gold)",
                        borderColor: "var(--color-gold-muted)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className="w-9 h-9 text-xs font-semibold border transition-colors"
                        style={{
                          backgroundColor: page === i ? "var(--color-gold)" : "transparent",
                          color: page === i ? "var(--color-obsidian)" : "var(--color-parchment)",
                          borderColor: page === i ? "var(--color-gold)" : "var(--color-smoke)",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page === totalPages - 1}
                      className="px-4 py-2 text-xs tracking-widest uppercase border transition-colors disabled:opacity-30"
                      style={{
                        color: "var(--color-gold)",
                        borderColor: "var(--color-gold-muted)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

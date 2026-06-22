import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, User, Menu, X, Crown, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: cartData } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const cartCount = cartData?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/catalogo", label: "Catálogo" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-sans tracking-widest uppercase">
        🎬 Bem-vindo à NOXY STORE &nbsp;·&nbsp; Entrega em todo o Brasil
      </div>

      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-obsidian/95 backdrop-blur-sm border-b border-gold-muted/30"
            : "bg-obsidian border-b border-gold-muted/20"
        }`}
        style={{ backgroundColor: "var(--color-obsidian)" }}
      >
        <div className="container">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex flex-col items-center gap-0 group">
              <div className="flex items-center gap-2">
                <span
                  className="font-serif text-2xl font-bold tracking-widest"
                  style={{ color: "var(--color-white-led)", fontFamily: "var(--font-serif)", textShadow: "0 0 10px oklch(65% 0.20 280 / 0.5)" }}
                >
                  NOXY STORE
                </span>
                <CheckCircle2
                  size={20}
                  style={{ color: "var(--color-purple)", fill: "var(--color-purple)" }}
                  className="animate-pulse"
                />
              </div>
              <span
                className="text-xs tracking-[0.4em] uppercase"
                style={{ color: "var(--color-purple-muted)", fontFamily: "var(--font-sans)", fontSize: "0.6rem" }}
              >
                Estilo &amp; Qualidade
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-sans tracking-widest uppercase transition-colors duration-200"
                  style={{
                    color: location === link.href ? "var(--color-gold)" : "var(--color-parchment)",
                    fontWeight: 500,
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Cart */}
              <Link
                href="/carrinho"
                className="relative p-2 transition-colors duration-200 group"
                style={{ color: "var(--color-parchment)" }}
              >
                <ShoppingBag
                  size={20}
                  className="group-hover:text-gold transition-colors"
                  style={{ color: "inherit" }}
                />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-sans font-bold"
                    style={{
                      backgroundColor: "var(--color-gold)",
                      color: "var(--color-obsidian)",
                    }}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/minha-conta"
                    className="flex items-center gap-2 text-xs tracking-widest uppercase transition-colors duration-200"
                    style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}
                  >
                    <User size={18} />
                    <span className="hidden md:inline">{user?.name?.split(" ")[0]}</span>
                  </Link>
                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="hidden md:inline-flex text-xs tracking-widest uppercase px-3 py-1 border transition-colors duration-200"
                      style={{
                        color: "var(--color-gold)",
                        borderColor: "var(--color-gold)",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 500,
                      }}
                    >
                      Admin
                    </Link>
                  )}
                </div>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="text-xs tracking-widest uppercase px-4 py-2 border transition-all duration-200 hover:bg-gold hover:text-obsidian"
                  style={{
                    color: "var(--color-gold)",
                    borderColor: "var(--color-gold)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                  }}
                >
                  Entrar
                </a>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ color: "var(--color-parchment)" }}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className="md:hidden border-t py-4"
            style={{
              backgroundColor: "var(--color-charcoal)",
              borderColor: "var(--color-gold-muted)",
            }}
          >
            <div className="container flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs tracking-widest uppercase py-2"
                  style={{
                    color: location === link.href ? "var(--color-gold)" : "var(--color-parchment)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  href="/minha-conta"
                  className="text-xs tracking-widest uppercase py-2"
                  style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Minha Conta
                </Link>
              )}
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-xs tracking-widest uppercase py-2"
                  style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Painel Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        className="border-t mt-20"
        style={{
          backgroundColor: "var(--color-charcoal)",
          borderColor: "var(--color-gold-muted)",
        }}
      >
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3
                className="font-serif text-lg mb-4 tracking-widest"
                style={{ color: "var(--color-gold)" }}
              >
                MAISON DORÉE
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
              >
                Curadoria de produtos de luxo com excelência e sofisticação atemporal.
              </p>
            </div>
            <div>
              <h4
                className="font-sans text-xs tracking-widest uppercase mb-4 font-semibold"
                style={{ color: "var(--color-gold)" }}
              >
                Navegação
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  { href: "/", label: "Início" },
                  { href: "/catalogo", label: "Catálogo" },
                  { href: "/minha-conta", label: "Minha Conta" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm transition-colors duration-200"
                    style={{
                      color: "var(--color-gold-muted)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4
                className="font-sans text-xs tracking-widest uppercase mb-4 font-semibold"
                style={{ color: "var(--color-gold)" }}
              >
                Atendimento
              </h4>
              <p
                className="text-sm"
                style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
              >
                contato@maisondoree.com.br
                <br />
                Seg–Sex, 9h–18h
              </p>
            </div>
          </div>

          {/* Divider ornamental */}
          <div className="deco-divider my-6">
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
            >
              ◆
            </span>
          </div>

          <p
            className="text-center text-xs tracking-widest"
            style={{ color: "var(--color-smoke)", fontFamily: "var(--font-sans)" }}
          >
            © {new Date().getFullYear()} MAISON DORÉE · Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import { Input } from "@/components/ui/input";
import { Lock, User } from "lucide-react";
import { toast } from "sonner";

const ADMIN_USERNAME = "murillo";
const ADMIN_PASSWORD = "3005303030";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular delay de verificação
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Salvar sessão admin no localStorage
        localStorage.setItem("admin_session", JSON.stringify({
          username,
          timestamp: Date.now(),
        }));
        toast.success("Login realizado com sucesso!");
        navigate("/admin");
      } else {
        toast.error("Usuário ou senha incorretos");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <StoreLayout>
      <section
        className="min-h-screen flex items-center justify-center py-20"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="container max-w-md">
          {/* Header */}
          <div className="text-center mb-12">
            <h1
              className="font-serif text-5xl font-black mb-2"
              style={{ color: "var(--color-white-led)" }}
            >
              NOXY
            </h1>
            <p
              className="text-sm tracking-widest uppercase"
              style={{ color: "var(--color-purple)" }}
            >
              Painel Administrativo
            </p>
          </div>

          {/* Login Card */}
          <div
            className="p-8 rounded-lg"
            style={{
              backgroundColor: "var(--color-charcoal)",
              border: "1px solid var(--color-purple-muted)",
            }}
          >
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username */}
              <div>
                <label
                  className="block text-sm mb-3 tracking-widest uppercase font-semibold"
                  style={{ color: "var(--color-white-soft)" }}
                >
                  Usuário
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-3"
                    style={{ color: "var(--color-purple)" }}
                  />
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário"
                    className="pl-10"
                    style={{
                      backgroundColor: "var(--color-graphite)",
                      color: "var(--color-white-led)",
                      borderColor: "var(--color-smoke)",
                    }}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-sm mb-3 tracking-widest uppercase font-semibold"
                  style={{ color: "var(--color-white-soft)" }}
                >
                  Senha
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-3"
                    style={{ color: "var(--color-purple)" }}
                  />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="pl-10"
                    style={{
                      backgroundColor: "var(--color-graphite)",
                      color: "var(--color-white-led)",
                      borderColor: "var(--color-smoke)",
                    }}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full py-3 text-sm tracking-widest uppercase font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--color-purple)",
                  color: "var(--color-white-led)",
                  boxShadow: "0 0 20px oklch(65% 0.25 280 / 0.4)",
                }}
              >
                {loading ? "Verificando..." : "Entrar"}
              </button>
            </form>

            {/* Info */}
            <div
              className="mt-6 p-4 rounded text-xs text-center"
              style={{
                backgroundColor: "var(--color-background)",
                color: "var(--color-purple-muted)",
              }}
            >
              Acesso exclusivo para administradores
            </div>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}

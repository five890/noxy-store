import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Upload, Plus, CheckCircle, XCircle } from "lucide-react";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Verificar se é admin local (localStorage) ou admin do Manus
  const adminSession = typeof window !== 'undefined' ? localStorage.getItem("admin_session") : null;
  const isLocalAdmin = adminSession !== null;
  const isRemoteAdmin = !loading && user && user.role === "admin";
  const isAdmin = isLocalAdmin || isRemoteAdmin;

  // Redirecionar se nao for admin
  if (!loading && !isAdmin) {
    navigate("/admin-login");
    return null;
  }

  // Loading state - só mostrar se for admin remoto e ainda está carregando
  if (!isLocalAdmin && (loading || !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-background)" }}>
        <p style={{ color: "var(--color-white-soft)" }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--color-white-led)", fontFamily: "var(--font-serif)" }}>
            Painel Administrativo
          </h1>
          <div className="flex justify-between items-center">
            <p style={{ color: "var(--color-purple-muted)" }}>Gerencie sua loja e pedidos</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                try {
                  const data = await (window as any).trpc.query("admin.diagnoseDb");
                  console.log("DB Diagnosis:", data);
                  alert("Diagnóstico enviado para o console (F12)");
                } catch (e) {
                  console.error(e);
                  alert("Erro ao rodar diagnóstico");
                }
              }}
              style={{ borderColor: "var(--color-purple-muted)", color: "var(--color-purple-muted)" }}
            >
              Rodar Diagnóstico
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5" style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-purple-muted)" }}>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="proofs">Comprovantes</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoriesTab />
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="proofs" className="mt-6">
            <PaymentProofsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────
function DashboardTab() {
  const { data: stats } = trpc.admin.stats.useQuery();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-purple-muted)" }}>
        <div className="p-6">
          <p className="text-sm" style={{ color: "var(--color-purple-muted)" }}>Total de Pedidos</p>
          <p className="text-3xl font-bold" style={{ color: "var(--color-white-led)" }}>{stats?.totalOrders || 0}</p>
        </div>
      </Card>
      <Card style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-purple-muted)" }}>
        <div className="p-6">
          <p className="text-sm" style={{ color: "var(--color-purple-muted)" }}>Receita Total</p>
          <p className="text-3xl font-bold" style={{ color: "var(--color-white-led)" }}>R$ {Number(stats?.totalRevenue || 0).toFixed(2)}</p>
        </div>
      </Card>
      <Card style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-purple-muted)" }}>
        <div className="p-6">
          <p className="text-sm" style={{ color: "var(--color-purple-muted)" }}>Produtos</p>
          <p className="text-3xl font-bold" style={{ color: "var(--color-white-led)" }}>{stats?.totalProducts || 0}</p>
        </div>
      </Card>
      <Card style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-purple-muted)" }}>
        <div className="p-6">
          <p className="text-sm" style={{ color: "var(--color-purple-muted)" }}>Categorias</p>
          <p className="text-3xl font-bold" style={{ color: "var(--color-white-led)" }}>{(stats as any)?.totalCategories || 0}</p>
        </div>
      </Card>
    </div>
  );
}

// ─── Products Tab ────────────────────────────────────────────────────────
function ProductsTab() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    price: "",
    description: "",
    stock: "0",
    imageBase64: "",
    imageFilename: "",
    featured: false,
    onPromotion: false,
  });

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: products } = trpc.products.list.useQuery();
  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto criado!");
      setShowForm(false);
      setFormData({ categoryId: "", name: "", price: "", description: "", stock: "0", imageBase64: "", imageFilename: "", featured: false, onPromotion: false });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(",")[1] || "";
      setFormData({ ...formData, imageBase64: base64, imageFilename: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createProduct.mutate({
      categoryId: Number(formData.categoryId),
      name: formData.name,
      price: Number(formData.price),
      description: formData.description,
      stock: Number(formData.stock),
      imageBase64: formData.imageBase64,
      imageFilename: formData.imageFilename,
      featured: formData.featured,
      onPromotion: formData.onPromotion,
    } as any);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2 text-sm tracking-widest uppercase font-semibold transition-all"
        style={{ backgroundColor: "var(--color-purple)", color: "var(--color-white-led)" }}
      >
        <Plus size={16} /> Novo Produto
      </button>

      {showForm && (
        <Card style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-purple-muted)" }}>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: "var(--color-white-soft)" }}>Categoria *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 text-sm outline-none border"
                    style={{ backgroundColor: "var(--color-graphite)", color: "var(--color-white-led)", borderColor: "var(--color-smoke)" }}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: "var(--color-white-soft)" }}>Nome *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do produto"
                    style={{ backgroundColor: "var(--color-graphite)", color: "var(--color-white-led)", borderColor: "var(--color-smoke)" }}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: "var(--color-white-soft)" }}>Preço *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    style={{ backgroundColor: "var(--color-graphite)", color: "var(--color-white-led)", borderColor: "var(--color-smoke)" }}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: "var(--color-white-soft)" }}>Estoque</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    style={{ backgroundColor: "var(--color-graphite)", color: "var(--color-white-led)", borderColor: "var(--color-smoke)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: "var(--color-white-soft)" }}>Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do produto"
                  className="min-h-24"
                  style={{ backgroundColor: "var(--color-graphite)", color: "var(--color-white-led)", borderColor: "var(--color-smoke)" }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: "var(--color-white-soft)" }}>Imagem</label>
                <label className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer transition-all" style={{ backgroundColor: "var(--color-purple-muted)", color: "var(--color-white-led)" }}>
                  <Upload size={16} />
                  {formData.imageFilename ? formData.imageFilename : "Selecionar Imagem"}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2" style={{ color: "var(--color-white-soft)" }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  Destaque
                </label>
                <label className="flex items-center gap-2" style={{ color: "var(--color-white-soft)" }}>
                  <input
                    type="checkbox"
                    checked={formData.onPromotion}
                    onChange={(e) => setFormData({ ...formData, onPromotion: e.target.checked })}
                  />
                  Em Promoção
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createProduct.isPending}
                  className="flex-1 px-4 py-2 text-sm tracking-widest uppercase font-semibold transition-all disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-purple)", color: "var(--color-white-led)" }}
                >
                  Criar Produto
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 text-sm tracking-widest uppercase font-semibold transition-all"
                  style={{ backgroundColor: "var(--color-purple-muted)", color: "var(--color-white-led)" }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {Array.isArray(products) && products.map((product: any) => (
          <Card key={product.id} style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-purple-muted)" }}>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="font-semibold" style={{ color: "var(--color-white-led)" }}>{product.name}</h4>
                <p className="text-sm" style={{ color: "var(--color-purple-muted)" }}>R$ {Number(product.price).toFixed(2)} • Estoque: {product.stock}</p>
              </div>
              {product.featured && <span style={{ color: "var(--color-purple)" }}>★ Destaque</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Categories Tab ────────────────────────────────────────────────────────
function CategoriesTab() {
  const [name, setName] = useState("");
  const { data: categories } = trpc.categories.list.useQuery();
  const utils = trpc.useUtils();
  const createCategory = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada!");
      setName("");
      utils.categories.list.invalidate();
    },
    onError: (err: any) => {
      console.error("[CategoriesTab] Erro ao criar categoria:", err);
      toast.error(err.message || "Erro ao criar categoria");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    createCategory.mutate({ name, slug } as any);
  };

  return (
    <div className="space-y-6">
      <Card style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-purple-muted)" }}>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nova categoria"
              style={{ backgroundColor: "var(--color-graphite)", color: "var(--color-white-led)", borderColor: "var(--color-smoke)" }}
            />
            <button
              type="submit"
              disabled={createCategory.isPending}
              className="px-4 py-2 text-sm tracking-widest uppercase font-semibold transition-all disabled:opacity-50"
              style={{ backgroundColor: "var(--color-purple)", color: "var(--color-white-led)" }}
            >
              Criar
            </button>
          </form>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories?.map((category: any) => (
          <Card key={category.id} style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-purple-muted)" }}>
            <div className="p-4">
              <h4 className="font-semibold" style={{ color: "var(--color-white-led)" }}>{category.name}</h4>
              <p className="text-sm" style={{ color: "var(--color-purple-muted)" }}>{category.slug}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Orders Tab ────────────────────────────────────────────────────────
function OrdersTab() {
  const { data: ordersData } = trpc.orders.adminList.useQuery();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deliveryDates, setDeliveryDates] = useState<Record<number, string>>({});
  const updateDeliveryDate = trpc.orders.updateDeliveryDate.useMutation({
    onSuccess: () => toast.success("Data de entrega atualizada!"),
  });

  const handleUpdateDeliveryDate = (id: number) => {
    const date = deliveryDates[id];
    if (!date) {
      toast.error("Selecione uma data");
      return;
    }
    updateDeliveryDate.mutate({ id, estimatedDeliveryDate: new Date(date) } as any);
  };

  return (
    <div className="space-y-4">
      {ordersData?.items?.map((order: any) => (
        <div key={order.id} className="border" style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-purple-muted)" }}>
          <button
            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            className="w-full p-4 text-left flex items-center justify-between hover:opacity-80 transition-opacity"
          >
            <div>
              <h4 className="font-semibold" style={{ color: "var(--color-white-led)" }}>
                Pedido #{order.id}
              </h4>
              <p className="text-sm" style={{ color: "var(--color-purple-muted)" }}>
                {new Date(order.createdAt).toLocaleDateString("pt-BR")} • R$ {Number(order.total).toFixed(2)}
              </p>
            </div>
            <span style={{ color: "var(--color-purple)" }}>{expandedId === order.id ? "▼" : "▶"}</span>
          </button>

          {expandedId === order.id && (
            <div className="p-4 border-t" style={{ borderColor: "var(--color-purple-muted)" }}>
              <p className="mb-3" style={{ color: "var(--color-white-soft)" }}>
                <strong>Status:</strong> {order.status}
              </p>
              {order.estimatedDeliveryDate && (
                <p className="mb-3" style={{ color: "var(--color-white-soft)" }}>
                  <strong>Entrega prevista:</strong> {new Date(order.estimatedDeliveryDate).toLocaleDateString("pt-BR")}
                </p>
              )}
              <div className="flex gap-2">
                <input
                  type="date"
                  value={deliveryDates[order.id] || ""}
                  onChange={(e) => setDeliveryDates({ ...deliveryDates, [order.id]: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm outline-none border"
                  style={{ backgroundColor: "var(--color-graphite)", color: "var(--color-white-led)", borderColor: "var(--color-smoke)" }}
                />
                <button
                  onClick={() => handleUpdateDeliveryDate(order.id)}
                  disabled={updateDeliveryDate.isPending}
                  className="px-4 py-2 text-xs tracking-widest uppercase font-semibold transition-all disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-purple)", color: "var(--color-white-led)", fontFamily: "var(--font-sans)" }}
                >
                  Atualizar
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Payment Proofs Tab ────────────────────────────────────────────────────────
function PaymentProofsTab() {
  const { data: proofsData } = trpc.paymentProofs.allList.useQuery();
  const approveProof = trpc.paymentProofs.approve.useMutation({
    onSuccess: () => toast.success("Comprovante aprovado!"),
  });
  const rejectProof = trpc.paymentProofs.reject.useMutation({
    onSuccess: () => toast.success("Comprovante rejeitado!"),
  });

  const proofs = proofsData?.items || [];

  return (
    <div className="space-y-4">
      {!proofsData || proofs.length === 0 ? (
        <p style={{ color: "var(--color-white-soft)" }}>Nenhum comprovante pendente</p>
      ) : (
        proofs.map((proof: any) => (
          <div key={proof.id} className="p-4 border" style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-purple-muted)" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold" style={{ color: "var(--color-white-led)" }}>
                  Pedido #{proof.orderId}
                </h4>
                <p className="text-sm" style={{ color: "var(--color-purple-muted)" }}>
                  Status: {proof.status}
                </p>
              </div>
              {proof.proofUrl && (
                <a href={proof.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: "var(--color-purple)" }}>
                  Ver Comprovante
                </a>
              )}
            </div>
            {proof.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => approveProof.mutate({ id: proof.id } as any)}
                  disabled={approveProof.isPending}
                  className="flex-1 px-3 py-2 text-xs tracking-widest uppercase font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                  style={{ backgroundColor: "var(--color-success)", color: "var(--color-white-led)", fontFamily: "var(--font-sans)" }}
                >
                  <CheckCircle size={14} /> Aprovar
                </button>
                <button
                  onClick={() => rejectProof.mutate({ id: proof.id, notes: "Comprovante inválido" } as any)}
                  disabled={rejectProof.isPending}
                  className="flex-1 px-3 py-2 text-xs tracking-widest uppercase font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                  style={{ backgroundColor: "var(--color-destructive)", color: "var(--color-white-led)", fontFamily: "var(--font-sans)" }}
                >
                  <XCircle size={14} /> Rejeitar
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

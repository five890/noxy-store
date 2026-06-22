import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Plus, Pencil, Trash2,
  X, Upload, Eye, EyeOff, BarChart3, TrendingUp, Users, Loader2, CheckCircle, XCircle
} from "lucide-react";
import { toast } from "sonner";

type Tab = "dashboard" | "products" | "categories" | "orders" | "proofs";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <h1 className="font-serif text-3xl mb-4" style={{ color: "var(--color-ivory)" }}>
            Acesso Restrito
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
            Esta área é exclusiva para administradores.
          </p>
          <Link href="/" className="text-xs tracking-widest uppercase" style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}>
            Voltar ao início
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const tabs = [
    { id: "dashboard" as Tab, label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: "products" as Tab, label: "Produtos", icon: <Package size={16} /> },
    { id: "categories" as Tab, label: "Categorias", icon: <Tag size={16} /> },
    { id: "orders" as Tab, label: "Pedidos", icon: <ShoppingCart size={16} /> },
    { id: "proofs" as Tab, label: "Comprovantes", icon: <Upload size={16} /> },
  ];

  return (
    <StoreLayout>
      {/* Header */}
      <section className="py-12 border-b" style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}>
        <div className="container">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, var(--color-gold))" }} />
            <span className="text-xs tracking-[0.5em] uppercase" style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}>
              Administração
            </span>
          </div>
          <h1 className="font-serif text-4xl font-bold" style={{ color: "var(--color-ivory)" }}>
            Painel Administrativo
          </h1>
        </div>
      </section>

      <div className="container py-8">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 border-b" style={{ borderColor: "var(--color-smoke)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-3 text-xs tracking-widest uppercase font-semibold transition-all border-b-2 -mb-px"
              style={{
                color: activeTab === tab.id ? "var(--color-gold)" : "var(--color-gold-muted)",
                borderBottomColor: activeTab === tab.id ? "var(--color-gold)" : "transparent",
                fontFamily: "var(--font-sans)",
              }}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "proofs" && <PaymentProofsTab />}
      </div>
    </StoreLayout>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab() {
  const { data: stats } = trpc.admin.stats.useQuery();

  const statCards = [
    { label: "Pedidos Pagos", value: stats?.totalOrders ?? 0, icon: <ShoppingCart size={20} />, format: "number" },
    { label: "Receita Total", value: stats?.totalRevenue ?? 0, icon: <TrendingUp size={20} />, format: "currency" },
    { label: "Produtos Ativos", value: stats?.totalProducts ?? 0, icon: <Package size={20} />, format: "number" },
    { label: "Categorias", value: stats?.totalCategories ?? 0, icon: <Tag size={20} />, format: "number" },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="p-5 border relative"
            style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}
          >
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r" style={{ borderColor: "var(--color-gold)", opacity: 0.4 }} />
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: "var(--color-gold)" }}>{card.icon}</span>
            </div>
            <p className="font-serif text-2xl font-bold mb-1" style={{ color: "var(--color-gold)" }}>
              {card.format === "currency"
                ? Number(card.value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : card.value}
            </p>
            <p className="text-xs tracking-widest uppercase" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="p-6 border" style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}>
        <h2 className="font-serif text-xl font-bold mb-4" style={{ color: "var(--color-ivory)" }}>
          Ações Rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2 text-xs tracking-widest uppercase font-semibold border transition-colors hover:bg-gold/10"
            style={{ color: "var(--color-gold)", borderColor: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
          >
            <Plus size={14} /> Novo Produto
          </button>
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2 text-xs tracking-widest uppercase font-semibold border transition-colors hover:bg-gold/10"
            style={{ color: "var(--color-gold)", borderColor: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
          >
            <Plus size={14} /> Nova Categoria
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────
function ProductsTab() {
  const utils = trpc.useUtils();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: productsData, isLoading } = trpc.products.list.useQuery({ limit: 50 });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    categoryId: 0,
    name: "",
    slug: "",
    description: "",
    price: "",
    compareAtPrice: "",
    stock: 0,
    featured: false,
    onSale: false,
    active: true,
    coverImageUrl: "",
    tags: "",
  });

  const uploadImage = trpc.admin.uploadImage.useMutation();
  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); resetForm(); toast.success("Produto criado!"); },
  });
  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); resetForm(); toast.success("Produto atualizado!"); },
  });
  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); toast.success("Produto removido!"); },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    setForm({ categoryId: 0, name: "", slug: "", description: "", price: "", compareAtPrice: "", stock: 0, featured: false, onSale: false, active: true, coverImageUrl: "", tags: "" });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let coverImageUrl = form.coverImageUrl;

    if (imageFile) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          resolve(result.split(",")[1] ?? "");
        };
        reader.readAsDataURL(imageFile);
      });
      const result = await uploadImage.mutateAsync({ base64, filename: imageFile.name, mimeType: imageFile.type });
      coverImageUrl = result.url;
    }

    const data = {
      ...form,
      coverImageUrl: coverImageUrl || undefined,
      compareAtPrice: form.compareAtPrice || undefined,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
    };

    if (editingId) {
      updateProduct.mutate({ id: editingId, ...data } as any);
    } else {
      createProduct.mutate(data as any);
    }
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setForm({
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? "",
      stock: product.stock,
      featured: product.featured,
      onSale: product.onSale,
      active: product.active,
      coverImageUrl: product.coverImageUrl ?? "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
    });
    setImagePreview(product.coverImageUrl ?? null);
    setShowForm(true);
  };

  const inputStyle = {
    backgroundColor: "var(--color-graphite)",
    color: "var(--color-ivory)",
    borderColor: "var(--color-smoke)",
    fontFamily: "var(--font-sans)",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--color-ivory)" }}>
          Produtos ({productsData?.total ?? 0})
        </h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 text-xs tracking-widest uppercase font-semibold transition-all hover:scale-105"
          style={{ backgroundColor: "var(--color-gold)", color: "var(--color-obsidian)", fontFamily: "var(--font-sans)" }}
        >
          <Plus size={14} /> Novo Produto
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 p-6 border relative" style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg font-bold" style={{ color: "var(--color-ivory)" }}>
              {editingId ? "Editar Produto" : "Novo Produto"}
            </h3>
            <button onClick={resetForm} style={{ color: "var(--color-gold-muted)" }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image upload */}
            <div className="md:col-span-2">
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                Imagem do Produto
              </label>
              <div className="flex items-start gap-4">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover border" style={{ borderColor: "var(--color-gold-muted)" }} />
                )}
                <label
                  className="flex items-center gap-2 px-4 py-3 border cursor-pointer text-xs tracking-widest uppercase font-semibold transition-colors hover:bg-gold/10"
                  style={{ color: "var(--color-gold)", borderColor: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
                >
                  <Upload size={14} />
                  {imageFile ? imageFile.name : "Selecionar Imagem"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>Categoria *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
                required
                className="w-full px-3 py-2.5 text-sm outline-none border"
                style={inputStyle}
              >
                <option value={0}>Selecione...</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>Nome *</label>
              <input type="text" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }); }} required className="w-full px-3 py-2.5 text-sm outline-none border" style={inputStyle} />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>Slug *</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="w-full px-3 py-2.5 text-sm outline-none border" style={inputStyle} />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>Preço (R$) *</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full px-3 py-2.5 text-sm outline-none border" style={inputStyle} />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>Preço Original (R$)</label>
              <input type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className="w-full px-3 py-2.5 text-sm outline-none border" style={inputStyle} />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>Estoque</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="w-full px-3 py-2.5 text-sm outline-none border" style={inputStyle} />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>Tags (separadas por vírgula)</label>
              <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="luxo, exclusivo, premium" className="w-full px-3 py-2.5 text-sm outline-none border" style={inputStyle} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>Descrição</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 text-sm outline-none border resize-none" style={inputStyle} />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-6">
              {[
                { key: "active", label: "Ativo" },
                { key: "featured", label: "Destaque" },
                { key: "onSale", label: "Em Promoção" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: "var(--color-gold)" }}
                  />
                  <span className="text-sm" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>{label}</span>
                </label>
              ))}
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending || uploadImage.isPending}
                className="px-6 py-2.5 text-xs tracking-widest uppercase font-semibold transition-all hover:scale-105 disabled:opacity-50"
                style={{ backgroundColor: "var(--color-gold)", color: "var(--color-obsidian)", fontFamily: "var(--font-sans)" }}
              >
                {uploadImage.isPending ? "Enviando imagem..." : createProduct.isPending || updateProduct.isPending ? "Salvando..." : editingId ? "Atualizar" : "Criar Produto"}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 text-xs tracking-widest uppercase font-semibold border" style={{ color: "var(--color-gold-muted)", borderColor: "var(--color-smoke)", fontFamily: "var(--font-sans)" }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse" style={{ backgroundColor: "var(--color-charcoal)" }} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {productsData?.items.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 border"
              style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-smoke)" }}
            >
              <div className="w-12 h-12 flex-shrink-0 overflow-hidden" style={{ backgroundColor: "var(--color-graphite)" }}>
                {product.coverImageUrl ? (
                  <img src={product.coverImageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={16} style={{ color: "var(--color-smoke)" }} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--color-ivory)", fontFamily: "var(--font-sans)" }}>{product.name}</p>
                <p className="text-xs" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                  {Number(product.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · Estoque: {product.stock}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {product.featured && <span className="text-xs px-1.5 py-0.5 border" style={{ color: "var(--color-gold)", borderColor: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>Destaque</span>}
                {product.onSale && <span className="text-xs px-1.5 py-0.5" style={{ backgroundColor: "var(--color-gold)", color: "var(--color-obsidian)", fontFamily: "var(--font-sans)" }}>Promoção</span>}
                {!product.active && <span className="text-xs px-1.5 py-0.5" style={{ color: "var(--color-destructive)", fontFamily: "var(--font-sans)" }}>Inativo</span>}
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(product)} className="p-1.5 transition-colors hover:text-gold" style={{ color: "var(--color-gold-muted)" }}>
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => { if (confirm("Remover este produto?")) deleteProduct.mutate({ id: product.id }); }}
                  className="p-1.5 transition-colors hover:text-destructive"
                  style={{ color: "var(--color-gold-muted)" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {!productsData?.items.length && (
            <div className="text-center py-12" style={{ color: "var(--color-gold-muted)" }}>
              <Package size={40} className="mx-auto mb-3" />
              <p className="text-sm" style={{ fontFamily: "var(--font-sans)" }}>Nenhum produto cadastrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────
function CategoriesTab() {
  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.categories.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", imageUrl: "", featured: false, sortOrder: 0 });

  const createCat = trpc.categories.create.useMutation({ onSuccess: () => { utils.categories.list.invalidate(); resetForm(); toast.success("Categoria criada!"); } });
  const updateCat = trpc.categories.update.useMutation({ onSuccess: () => { utils.categories.list.invalidate(); resetForm(); toast.success("Categoria atualizada!"); } });
  const deleteCat = trpc.categories.delete.useMutation({ onSuccess: () => { utils.categories.list.invalidate(); toast.success("Categoria removida!"); } });

  const resetForm = () => { setShowForm(false); setEditingId(null); setForm({ name: "", slug: "", description: "", imageUrl: "", featured: false, sortOrder: 0 }); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) updateCat.mutate({ id: editingId, ...form });
    else createCat.mutate(form);
  };

  const inputStyle = { backgroundColor: "var(--color-graphite)", color: "var(--color-ivory)", borderColor: "var(--color-smoke)", fontFamily: "var(--font-sans)" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--color-ivory)" }}>
          Categorias ({categories?.length ?? 0})
        </h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-xs tracking-widest uppercase font-semibold transition-all hover:scale-105" style={{ backgroundColor: "var(--color-gold)", color: "var(--color-obsidian)", fontFamily: "var(--font-sans)" }}>
          <Plus size={14} /> Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 border" style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-gold-muted)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold" style={{ color: "var(--color-ivory)" }}>{editingId ? "Editar" : "Nova"} Categoria</h3>
            <button onClick={resetForm} style={{ color: "var(--color-gold-muted)" }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>Nome *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} required className="w-full px-3 py-2.5 text-sm outline-none border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>Slug *</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="w-full px-3 py-2.5 text-sm outline-none border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>URL da Imagem</label>
              <input type="text" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full px-3 py-2.5 text-sm outline-none border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>Ordem</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="w-full px-3 py-2.5 text-sm outline-none border" style={inputStyle} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>Descrição</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 text-sm outline-none border" style={inputStyle} />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4" style={{ accentColor: "var(--color-gold)" }} />
                <span className="text-sm" style={{ color: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}>Exibir na página inicial</span>
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={createCat.isPending || updateCat.isPending} className="px-6 py-2.5 text-xs tracking-widest uppercase font-semibold transition-all hover:scale-105 disabled:opacity-50" style={{ backgroundColor: "var(--color-gold)", color: "var(--color-obsidian)", fontFamily: "var(--font-sans)" }}>
                {editingId ? "Atualizar" : "Criar"}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 text-xs tracking-widest uppercase font-semibold border" style={{ color: "var(--color-gold-muted)", borderColor: "var(--color-smoke)", fontFamily: "var(--font-sans)" }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {isLoading ? [1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse" style={{ backgroundColor: "var(--color-charcoal)" }} />) :
          categories?.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4 p-4 border" style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-smoke)" }}>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--color-ivory)", fontFamily: "var(--font-sans)" }}>{cat.name}</p>
                <p className="text-xs" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>/{cat.slug} {cat.featured ? "· Destaque" : ""}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingId(cat.id); setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? "", imageUrl: cat.imageUrl ?? "", featured: cat.featured, sortOrder: cat.sortOrder }); setShowForm(true); }} className="p-1.5" style={{ color: "var(--color-gold-muted)" }}><Pencil size={14} /></button>
                <button onClick={() => { if (confirm("Remover?")) deleteCat.mutate({ id: cat.id }); }} className="p-1.5" style={{ color: "var(--color-gold-muted)" }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        {!isLoading && !categories?.length && (
          <div className="text-center py-12" style={{ color: "var(--color-gold-muted)" }}>
            <Tag size={40} className="mx-auto mb-3" />
            <p className="text-sm" style={{ fontFamily: "var(--font-sans)" }}>Nenhuma categoria cadastrada</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab() {
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [deliveryDates, setDeliveryDates] = useState<Record<number, string>>({});
  const utils = trpc.useUtils();
  const { data: ordersData, isLoading } = trpc.orders.adminList.useQuery();
  const updateStatus = trpc.orders.updateStatus.useMutation({ onSuccess: () => { utils.orders.adminList.invalidate(); toast.success("Status atualizado!"); } });
  const updateDeliveryDate = trpc.orders.updateDeliveryDate.useMutation({
    onSuccess: () => {
      utils.orders.adminList.invalidate();
      toast.success("Data de entrega atualizada!");
      setExpandedOrder(null);
      setDeliveryDates({});
    },
    onError: (err) => toast.error(err.message || "Erro ao atualizar data"),
  });

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "Aguardando", color: "var(--color-warning)" },
    paid: { label: "Pago", color: "var(--color-success)" },
    processing: { label: "Processando", color: "var(--color-gold)" },
    shipped: { label: "Enviado", color: "var(--color-gold-light)" },
    delivered: { label: "Entregue", color: "var(--color-success)" },
    cancelled: { label: "Cancelado", color: "var(--color-destructive)" },
  };

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: "var(--color-ivory)" }}>
        Pedidos ({ordersData?.total ?? 0})
      </h2>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse" style={{ backgroundColor: "var(--color-charcoal)" }} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {ordersData?.items.map((order) => {
            const status = statusLabels[order.status] ?? { label: order.status, color: "var(--color-gold-muted)" };
            return (
              <div key={order.id} className="border" style={{ backgroundColor: "var(--color-charcoal)", borderColor: "var(--color-smoke)" }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 cursor-pointer hover:bg-opacity-50" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--color-ivory)", fontFamily: "var(--font-sans)" }}>
                      Pedido #{order.id} — {order.customerName ?? "Cliente"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")} · {order.customerEmail}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-serif text-base font-bold" style={{ color: "var(--color-gold)" }}>
                      {Number(order.totalAmount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>

                    <select
                      value={order.status}
                      onChange={(e) => { e.stopPropagation(); updateStatus.mutate({ id: order.id, status: e.target.value as any }); }}
                      className="px-2 py-1 text-xs border outline-none"
                      style={{ backgroundColor: "var(--color-graphite)", color: status.color, borderColor: "var(--color-smoke)", fontFamily: "var(--font-sans)" }}
                    >
                      {Object.entries(statusLabels).map(([val, { label }]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="p-4 border-t" style={{ borderColor: "var(--color-smoke)", backgroundColor: "var(--color-graphite)" }}>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs uppercase mb-2" style={{ color: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}>
                          Data de Entrega Prevista
                        </label>
                        <input
                          type="date"
                          value={deliveryDates[order.id] || (order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : "")}
                          onChange={(e) => setDeliveryDates({ ...deliveryDates, [order.id]: e.target.value })}
                          className="w-full px-3 py-2 text-sm border outline-none"
                          style={{ backgroundColor: "var(--color-charcoal)", color: "var(--color-ivory)", borderColor: "var(--color-smoke)", fontFamily: "var(--font-sans)" }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const dateValue = deliveryDates[order.id];
                            if (dateValue) {
                              updateDeliveryDate.mutate({
                                id: order.id,
                                estimatedDeliveryDate: new Date(dateValue),
                              });
                            }
                          }}
                          disabled={!deliveryDates[order.id] || updateDeliveryDate.isPending}
                          className="flex-1 px-3 py-2 text-xs tracking-widest uppercase font-semibold disabled:opacity-50"
                          style={{ backgroundColor: "var(--color-gold)", color: "var(--color-obsidian)", fontFamily: "var(--font-sans)" }}
                        >
                          {updateDeliveryDate.isPending ? "Salvando..." : "Salvar Data"}
                        </button>
                        <button
                          onClick={() => setExpandedOrder(null)}
                          className="px-3 py-2 text-xs border"
                          style={{ color: "var(--color-gold)", borderColor: "var(--color-gold-muted)", fontFamily: "var(--font-sans)" }}
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!ordersData?.items.length && (
            <div className="text-center py-12" style={{ color: "var(--color-gold-muted)" }}>
              <ShoppingCart size={40} className="mx-auto mb-3" />
              <p className="text-sm" style={{ fontFamily: "var(--font-sans)" }}>Nenhum pedido realizado ainda</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Payment Proofs Tab ───────────────────────────────────────────────────────
function PaymentProofsTab() {
  const [selectedProof, setSelectedProof] = useState<number | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");

  const { data: proofs, isLoading, refetch } = trpc.paymentProofs.pendingList.useQuery(
    { limit: 50, offset: 0 }
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

  return (
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
              Nenhum comprovante pendente.
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
                <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-sans)" }}>PDF</span>
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
  );
}

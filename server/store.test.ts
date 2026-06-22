import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),

  // Categories
  getAllCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Joias", slug: "joias", description: "Joias exclusivas", imageUrl: null, featured: true, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getFeaturedCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Joias", slug: "joias", description: "Joias exclusivas", imageUrl: null, featured: true, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getCategoryBySlug: vi.fn().mockResolvedValue(null),
  createCategory: vi.fn().mockResolvedValue(1),
  updateCategory: vi.fn().mockResolvedValue(undefined),
  deleteCategory: vi.fn().mockResolvedValue(undefined),

  // Products
  getProducts: vi.fn().mockResolvedValue({ items: [], total: 0, pages: 0 }),
  getProductBySlug: vi.fn().mockResolvedValue(null),
  getProductById: vi.fn().mockResolvedValue(null),
  getProductImages: vi.fn().mockResolvedValue([]),
  createProduct: vi.fn().mockResolvedValue(1),
  updateProduct: vi.fn().mockResolvedValue(undefined),
  deleteProduct: vi.fn().mockResolvedValue(undefined),
  addProductImage: vi.fn().mockResolvedValue(undefined),
  deleteProductImage: vi.fn().mockResolvedValue(undefined),

  // Cart
  getCartItems: vi.fn().mockResolvedValue([]),
  upsertCartItem: vi.fn().mockResolvedValue(undefined),
  removeCartItem: vi.fn().mockResolvedValue(undefined),
  clearCart: vi.fn().mockResolvedValue(undefined),

  // Orders
  createOrder: vi.fn().mockResolvedValue(1),
  getOrdersByUser: vi.fn().mockResolvedValue([]),
  getOrderById: vi.fn().mockResolvedValue(null),
  getOrderItems: vi.fn().mockResolvedValue([]),
  getAllOrders: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  getOrderByStripeSession: vi.fn().mockResolvedValue(null),

  // Admin
  getAdminStats: vi.fn().mockResolvedValue({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalCategories: 0 }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("categories router", () => {
  it("list returns categories array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toMatchObject({ name: "Joias", slug: "joias" });
  });

  it("featured returns featured categories", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.featured();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]?.featured).toBe(true);
  });
});

describe("products router", () => {
  it("list returns paginated products", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.products.list({});
    expect(result).toMatchObject({ items: [], total: 0 });
  });

  it("bySlug throws NOT_FOUND for unknown slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.products.bySlug({ slug: "unknown" })).rejects.toThrow();
  });
});

describe("cart router", () => {
  it("get returns empty cart for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.cart.get();
    expect(result).toMatchObject({ items: [], subtotal: 0 });
  });

  it("get throws UNAUTHORIZED for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.cart.get()).rejects.toThrow();
  });
});

describe("orders router", () => {
  it("myOrders returns empty array for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.orders.myOrders();
    expect(Array.isArray(result)).toBe(true);
  });

  it("myOrders throws for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.orders.myOrders()).rejects.toThrow();
  });
});

describe("admin router", () => {
  it("stats throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("stats returns stats for admin", async () => {
    const caller = appRouter.createCaller(createUserContext("admin"));
    const result = await caller.admin.stats();
    expect(result).toMatchObject({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalCategories: 0 });
  });
});

describe("auth router", () => {
  it("me returns null for unauthenticated", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.auth.me();
    expect(result?.email).toBe("test@example.com");
  });

  it("logout clears cookie and returns success", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});

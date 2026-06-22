import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  cartItems,
  categories,
  InsertCartItem,
  InsertCategory,
  InsertOrder,
  InsertOrderItem,
  InsertProduct,
  InsertProductImage,
  InsertUser,
  orderItems,
  orders,
  productImages,
  products,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.sortOrder, categories.name);
}

export async function getFeaturedCategories() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(categories)
    .where(eq(categories.featured, true))
    .orderBy(categories.sortOrder);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(categories).values(data);
  return result;
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getProducts(opts: {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [eq(products.active, true)];
  if (opts.categoryId) conditions.push(eq(products.categoryId, opts.categoryId));
  if (opts.search) {
    conditions.push(
      or(
        sql`${products.name} LIKE ${`%${opts.search}%`}`,
        sql`${products.description} LIKE ${`%${opts.search}%`}`
      )!
    );
  }
  if (opts.minPrice !== undefined) conditions.push(gte(products.price, String(opts.minPrice)));
  if (opts.maxPrice !== undefined) conditions.push(lte(products.price, String(opts.maxPrice)));
  if (opts.onSale !== undefined) conditions.push(eq(products.onSale, opts.onSale));
  if (opts.featured !== undefined) conditions.push(eq(products.featured, opts.featured));

  const where = and(...conditions);
  const limit = opts.limit ?? 20;
  const offset = opts.offset ?? 0;

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`COUNT(*)` }).from(products).where(where),
  ]);

  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function getProductImages(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.sortOrder);
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(productImages).where(eq(productImages.productId, id));
  await db.delete(products).where(eq(products.id, id));
}

export async function addProductImage(data: InsertProductImage) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(productImages).values(data);
  return result;
}

export async function deleteProductImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(productImages).where(eq(productImages.id, id));
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const items = await db
    .select({
      id: cartItems.id,
      userId: cartItems.userId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      createdAt: cartItems.createdAt,
      updatedAt: cartItems.updatedAt,
      productName: products.name,
      productSlug: products.slug,
      productPrice: products.price,
      productCompareAtPrice: products.compareAtPrice,
      productCoverImageUrl: products.coverImageUrl,
      productStock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));
  return items;
}

export async function upsertCartItem(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity });
  }
}

export async function removeCartItem(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function createOrder(data: InsertOrder, items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(orders).values(data);
  const insertId = (result as any).insertId as number;
  if (items.length > 0) {
    await db.insert(orderItems).values(items.map((i) => ({ ...i, orderId: insertId })));
  }
  return insertId;
}

export async function getOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getAllOrders(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const [items, countResult] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`COUNT(*)` }).from(orders),
  ]);
  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function updateOrderStatus(id: number, status: string, extra?: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .update(orders)
    .set({ status: status as any, ...extra })
    .where(eq(orders.id, id));
}

export async function getOrderByStripeSession(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
    .limit(1);
  return result[0];
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalCategories: 0 };

  const [ordersStats, productsCount, categoriesCount] = await Promise.all([
    db
      .select({
        total: sql<number>`COUNT(*)`,
        revenue: sql<number>`COALESCE(SUM(totalAmount), 0)`,
      })
      .from(orders)
      .where(eq(orders.status, "paid")),
    db.select({ count: sql<number>`COUNT(*)` }).from(products).where(eq(products.active, true)),
    db.select({ count: sql<number>`COUNT(*)` }).from(categories),
  ]);

  return {
    totalOrders: Number(ordersStats[0]?.total ?? 0),
    totalRevenue: Number(ordersStats[0]?.revenue ?? 0),
    totalProducts: Number(productsCount[0]?.count ?? 0),
    totalCategories: Number(categoriesCount[0]?.count ?? 0),
  };
}

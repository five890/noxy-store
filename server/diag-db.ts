import { getDb } from "./db";
import { sql } from "drizzle-orm";

async function diagnose() {
  console.log("--- Iniciando Diagnóstico de Banco de Dados ---");
  const db = await getDb();
  if (!db) {
    console.error("Erro: Não foi possível conectar ao banco de dados. Verifique a DATABASE_URL.");
    return;
  }

  try {
    console.log("Verificando tabelas existentes...");
    const tables = await db.execute(sql`SHOW TABLES`);
    console.log("Tabelas encontradas:", JSON.stringify(tables, null, 2));

    console.log("\nVerificando estrutura da tabela 'categories'...");
    const structure = await db.execute(sql`DESCRIBE categories`);
    console.log("Estrutura de 'categories':", JSON.stringify(structure, null, 2));

    console.log("\nVerificando estrutura da tabela 'products'...");
    const productsStructure = await db.execute(sql`DESCRIBE products`);
    console.log("Estrutura de 'products':", JSON.stringify(productsStructure, null, 2));

  } catch (error) {
    console.error("Erro durante o diagnóstico:", error);
  }
}

diagnose();

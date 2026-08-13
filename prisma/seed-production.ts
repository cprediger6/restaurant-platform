// scripts/seed-production.ts

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";

// Usar variables de entorno
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL no está definida");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Ejecutando seed en producción...");

  // 1. Crear compañía
  const company = await prisma.company.upsert({
    where: { ruc: "123456789" },
    update: {},
    create: {
      name: "Restaurante Ejemplo S.A.",
      ruc: "123456789",
      address: "Calle Principal #123, Ciudad",
      currency: "USD",
      timezone: "America/Panama",
      country: "Panama",
      taxRate: 7,
      taxName: "ITBMS",
    },
  });

  console.log(`✅ Compañía creada: ${company.name}`);

  // 2. Crear usuarios
  const adminPassword = await hash("admin123", 12);
  const waiterPassword = await hash("waiter123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@restaurant.com" },
    update: {},
    create: {
      email: "admin@restaurant.com",
      name: "Administrador",
      lastName: "Principal",
      password: adminPassword,
      role: "ADMIN",
      companyId: company.id,
      isActive: true,
    },
  });

  const waiter = await prisma.user.upsert({
    where: { email: "waiter@restaurant.com" },
    update: {},
    create: {
      email: "waiter@restaurant.com",
      name: "Carlos",
      lastName: "Mesa",
      password: waiterPassword,
      role: "WAITER",
      companyId: company.id,
      isActive: true,
    },
  });

  console.log(`✅ Usuarios creados:`);
  console.log(`  - ${admin.email} (${admin.role})`);
  console.log(`  - ${waiter.email} (${waiter.role})`);

  console.log("🌱 ¡Seed completado!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
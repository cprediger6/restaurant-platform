// scripts/create-user-prod.ts

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL no está definida");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔧 Creando usuario admin en producción...");

  // 1. Verificar si ya existe
  const existing = await prisma.user.findUnique({
    where: { email: "admin@restaurant.com" },
  });

  if (existing) {
    console.log("✅ Usuario admin ya existe:", existing.email);
    console.log("   Role:", existing.role);
    console.log("   Active:", existing.isActive);
    return;
  }

  // 2. Crear compañía si no existe
  let company = await prisma.company.findFirst();
  
  if (!company) {
    console.log("📦 Creando compañía...");
    company = await prisma.company.create({
      data: {
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
    console.log("✅ Compañía creada:", company.name);
  }

  // 3. Crear usuario admin
  const hashedPassword = await hash("admin123", 12);

  const user = await prisma.user.create({
    data: {
      email: "admin@restaurant.com",
      name: "Administrador",
      lastName: "Principal",
      password: hashedPassword,
      role: "ADMIN",
      companyId: company.id,
      isActive: true,
    },
  });

  console.log("✅ Usuario admin creado:", user.email);
  console.log("   Role:", user.role);
  console.log("   Password: admin123");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
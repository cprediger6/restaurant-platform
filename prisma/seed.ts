// prisma/seed.ts

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { hash } from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida en .env')
  process.exit(1)
}

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seeding en Neon...')

  // ============================================
  // 1. Crear COMPAÑÍA
  // ============================================
  const company = await prisma.company.upsert({
    where: { ruc: '123456789' },
    update: {},
    create: {
      name: 'Restaurante Ejemplo S.A.',
      ruc: '123456789',
      address: 'Calle Principal #123, Ciudad',
      currency: 'USD',
      timezone: 'America/Panama',
      country: 'Panama',
      taxRate: 7,
      taxName: 'ITBMS',
    },
  })
  console.log('✅ Compañía creada:', company.name)

  // ============================================
  // 2. Crear USUARIOS
  // ============================================
  const adminPassword = await hash('admin123', 12)
  const waiterPassword = await hash('waiter123', 12)

  await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      email: 'admin@restaurant.com',
      name: 'Administrador',
      lastName: 'Principal',
      password: adminPassword,
      role: 'ADMIN',
      companyId: company.id,
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'waiter@restaurant.com' },
    update: {},
    create: {
      email: 'waiter@restaurant.com',
      name: 'Carlos',
      lastName: 'Mesa',
      password: waiterPassword,
      role: 'WAITER',
      companyId: company.id,
      isActive: true,
    },
  })
  console.log('✅ Usuarios creados')

  // ============================================
  // 3. Crear MESAS
  // ============================================
  const tableData = [
    { number: '1', capacity: 4, status: 'AVAILABLE' as const, companyId: company.id },
    { number: '2', capacity: 4, status: 'AVAILABLE' as const, companyId: company.id },
    { number: '3', capacity: 4, status: 'AVAILABLE' as const, companyId: company.id },
    { number: '4', capacity: 4, status: 'AVAILABLE' as const, companyId: company.id },
    { number: '5', capacity: 4, status: 'AVAILABLE' as const, companyId: company.id },
    { number: '6', capacity: 6, status: 'AVAILABLE' as const, companyId: company.id },
    { number: '7', capacity: 6, status: 'AVAILABLE' as const, companyId: company.id },
    { number: '8', capacity: 8, status: 'AVAILABLE' as const, companyId: company.id },
    { number: '9', capacity: 8, status: 'AVAILABLE' as const, companyId: company.id },
    { number: '10', capacity: 10, status: 'AVAILABLE' as const, companyId: company.id },
  ]

  for (const table of tableData) {
    try {
      await prisma.table.create({ data: table })
    } catch (error: any) {
      if (error.code !== 'P2002') throw error
    }
  }
  console.log('✅ 10 mesas creadas')

  // ============================================
  // 4. Crear CATEGORÍAS
  // ============================================
  const categoryData = [
    { name: 'Bebidas', description: 'Bebidas frías y calientes', companyId: company.id },
    { name: 'Entradas', description: 'Aperitivos y entradas', companyId: company.id },
    { name: 'Platos Principales', description: 'Platos fuertes', companyId: company.id },
    { name: 'Postres', description: 'Dulces y postres', companyId: company.id },
  ]

  for (const category of categoryData) {
    try {
      await prisma.category.create({ data: category })
    } catch (error: any) {
      if (error.code !== 'P2002') throw error
    }
  }
  console.log('✅ 4 categorías creadas')

  // ============================================
  // 5. Crear PRODUCTOS (sin price)
  // ============================================
  const categoryList = await prisma.category.findMany({
    where: { companyId: company.id },
  })
  const categoryMap = Object.fromEntries(
    categoryList.map(cat => [cat.name, cat.id])
  )

  const productData = [
    {
      name: 'Café Americano',
      description: 'Café negro preparado al momento',
      internalCode: 'P001',
      sku: 'SKU-001',
      categoryId: categoryMap['Bebidas'],
      companyId: company.id,
      isActive: true,
      unitOfMeasure: 'taza',
    },
    {
      name: 'Jugo de Naranja',
      description: 'Jugo natural de naranja recién exprimido',
      internalCode: 'P002',
      sku: 'SKU-002',
      categoryId: categoryMap['Bebidas'],
      companyId: company.id,
      isActive: true,
      unitOfMeasure: 'vaso',
    },
    {
      name: 'Hamburguesa Clásica',
      description: 'Hamburguesa con queso, lechuga y tomate',
      internalCode: 'P003',
      sku: 'SKU-003',
      categoryId: categoryMap['Platos Principales'],
      companyId: company.id,
      isActive: true,
      unitOfMeasure: 'unidad',
    },
    {
      name: 'Pasta Carbonara',
      description: 'Pasta con salsa carbonara y panceta',
      internalCode: 'P004',
      sku: 'SKU-004',
      categoryId: categoryMap['Platos Principales'],
      companyId: company.id,
      isActive: true,
      unitOfMeasure: 'porción',
    },
    {
      name: 'Ensalada César',
      description: 'Ensalada con pollo, crutones y aderezo César',
      internalCode: 'P005',
      sku: 'SKU-005',
      categoryId: categoryMap['Entradas'],
      companyId: company.id,
      isActive: true,
      unitOfMeasure: 'porción',
    },
    {
      name: 'Flan de Vainilla',
      description: 'Flan casero con caramelo',
      internalCode: 'P006',
      sku: 'SKU-006',
      categoryId: categoryMap['Postres'],
      companyId: company.id,
      isActive: true,
      unitOfMeasure: 'porción',
    },
    {
      name: 'Agua Mineral',
      description: 'Agua mineral sin gas 500ml',
      internalCode: 'P007',
      sku: 'SKU-007',
      categoryId: categoryMap['Bebidas'],
      companyId: company.id,
      isActive: true,
      unitOfMeasure: 'botella',
    },
  ]

  for (const product of productData) {
    try {
      await prisma.product.create({ data: product })
    } catch (error: any) {
      if (error.code !== 'P2002') throw error
    }
  }
  console.log('✅ 7 productos creados')

  // ============================================
  // 6. Crear VARIANTES con precios
  // ============================================
  const products = await prisma.product.findMany({
    where: { companyId: company.id },
  })
  const productMap = Object.fromEntries(
    products.map(p => [p.name, p.id])
  )

  const variantData = [
    {
      productId: productMap['Café Americano'],
      name: 'Default',
      value: 'Standard',
      price: 2.50,
      cost: 1.00,
      sku: 'VAR-001',
      stock: 100,
    },
    {
      productId: productMap['Jugo de Naranja'],
      name: 'Default',
      value: 'Standard',
      price: 3.00,
      cost: 1.50,
      sku: 'VAR-002',
      stock: 80,
    },
    {
      productId: productMap['Hamburguesa Clásica'],
      name: 'Default',
      value: 'Standard',
      price: 12.50,
      cost: 5.00,
      sku: 'VAR-003',
      stock: 50,
    },
    {
      productId: productMap['Pasta Carbonara'],
      name: 'Default',
      value: 'Standard',
      price: 14.00,
      cost: 6.00,
      sku: 'VAR-004',
      stock: 40,
    },
    {
      productId: productMap['Ensalada César'],
      name: 'Default',
      value: 'Standard',
      price: 8.50,
      cost: 3.50,
      sku: 'VAR-005',
      stock: 60,
    },
    {
      productId: productMap['Flan de Vainilla'],
      name: 'Default',
      value: 'Standard',
      price: 5.00,
      cost: 2.00,
      sku: 'VAR-006',
      stock: 70,
    },
    {
      productId: productMap['Agua Mineral'],
      name: 'Default',
      value: 'Standard',
      price: 1.50,
      cost: 0.50,
      sku: 'VAR-007',
      stock: 200,
    },
  ]

  for (const variant of variantData) {
    try {
      await prisma.variant.create({ data: variant })
    } catch (error: any) {
      if (error.code !== 'P2002') throw error
    }
  }
  console.log('✅ 7 variantes con precios creadas')

  // ============================================
  // 7. Crear RECETAS
  // ============================================
  const recipeData = [
    {
      name: 'Hamburguesa Clásica',
      description: 'Receta de hamburguesa con todos los ingredientes',
      yield: 1,
      unit: 'unidad',
      companyId: company.id,
      isActive: true,
    },
    {
      name: 'Pasta Carbonara',
      description: 'Receta de pasta carbonara',
      yield: 1,
      unit: 'porción',
      companyId: company.id,
      isActive: true,
    },
  ]

  for (const recipe of recipeData) {
    try {
      await prisma.recipe.create({ data: recipe })
    } catch (error: any) {
      if (error.code !== 'P2002') throw error
    }
  }
  console.log('✅ 2 recetas creadas')

  // ============================================
  // 8. Crear INGREDIENTES de recetas
  // ============================================
  const recipes = await prisma.recipe.findMany({
    where: { companyId: company.id },
  })
  const recipeMap = Object.fromEntries(
    recipes.map(r => [r.name, r.id])
  )

  const ingredientData = [
    {
      recipeId: recipeMap['Hamburguesa Clásica'],
      productId: productMap['Hamburguesa Clásica'],
      quantity: 1,
      unit: 'unidad',
      consumeInventory: true,
    },
    {
      recipeId: recipeMap['Pasta Carbonara'],
      productId: productMap['Pasta Carbonara'],
      quantity: 1,
      unit: 'porción',
      consumeInventory: true,
    },
  ]

  for (const ingredient of ingredientData) {
    if (!ingredient.recipeId || !ingredient.productId) continue
    try {
      await prisma.recipeIngredient.create({ data: ingredient })
    } catch (error: any) {
      if (error.code !== 'P2002') throw error
    }
  }
  console.log('✅ Ingredientes de recetas creados')

  console.log('🌱 ¡Seeding completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
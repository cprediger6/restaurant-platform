// prisma/seed.ts

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { hash } from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

// ============================================================
// VALIDAR VARIABLES DE ENTORNO
// ============================================================

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida en .env')
  process.exit(1)
}

// ============================================================
// PRISMA + NEON
// ============================================================

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
})

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('')
  console.log('============================================')
  console.log('🌱 INICIANDO SEEDING EN NEON')
  console.log('============================================')
  console.log('')

  // ==========================================================
  // 1. COMPAÑÍA
  // ==========================================================

  const company = await prisma.company.upsert({
    where: {
      ruc: '123456789',
    },
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

  console.log(`✅ Compañía creada: ${company.name}`)

  // ==========================================================
  // 2. USUARIOS
  // ==========================================================

  const adminPassword = await hash('admin123', 12)
  const waiterPassword = await hash('waiter123', 12)

  await prisma.user.upsert({
    where: {
      email: 'admin@restaurant.com',
    },
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
    where: {
      email: 'waiter@restaurant.com',
    },
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

  // ==========================================================
  // 3. MESAS
  // ==========================================================

  const tableData = [
    { number: '1', capacity: 4 },
    { number: '2', capacity: 4 },
    { number: '3', capacity: 4 },
    { number: '4', capacity: 4 },
    { number: '5', capacity: 4 },
    { number: '6', capacity: 6 },
    { number: '7', capacity: 6 },
    { number: '8', capacity: 8 },
    { number: '9', capacity: 8 },
    { number: '10', capacity: 10 },
  ]

  for (const table of tableData) {
    try {
      await prisma.table.create({
        data: {
          number: table.number,
          capacity: table.capacity,
          status: 'AVAILABLE',
          companyId: company.id,
        },
      })
    } catch (error: any) {
      if (error.code !== 'P2002') {
        throw error
      }
    }
  }

  console.log('✅ 10 mesas creadas')

  // ==========================================================
  // 4. CATEGORÍAS
  // ==========================================================

  const categoryData = [
    {
      name: 'Bebidas',
      description: 'Bebidas frías y calientes',
    },
    {
      name: 'Entradas',
      description: 'Aperitivos y entradas',
    },
    {
      name: 'Platos Principales',
      description: 'Platos fuertes',
    },
    {
      name: 'Postres',
      description: 'Dulces y postres',
    },
  ]

  for (const category of categoryData) {
    try {
      await prisma.category.create({
        data: {
          name: category.name,
          description: category.description,
          companyId: company.id,
        },
      })
    } catch (error: any) {
      if (error.code !== 'P2002') {
        throw error
      }
    }
  }

  console.log('✅ 4 categorías creadas')

  // ==========================================================
  // 5. OBTENER CATEGORÍAS
  // ==========================================================

  const categories = await prisma.category.findMany({
    where: {
      companyId: company.id,
    },
  })

  const categoryMap: Record<string, string> = {}

  for (const category of categories) {
    categoryMap[category.name] = category.id
  }

  // ==========================================================
  // 6. PRODUCTOS
  // ==========================================================

  const productData = [
    {
      name: 'Café Americano',
      description: 'Café negro preparado al momento',
      internalCode: 'P001',
      sku: 'SKU-001',
      category: 'Bebidas',
      unitOfMeasure: 'taza',
    },
    {
      name: 'Jugo de Naranja',
      description: 'Jugo natural de naranja recién exprimido',
      internalCode: 'P002',
      sku: 'SKU-002',
      category: 'Bebidas',
      unitOfMeasure: 'vaso',
    },
    {
      name: 'Hamburguesa Clásica',
      description: 'Hamburguesa con queso, lechuga y tomate',
      internalCode: 'P003',
      sku: 'SKU-003',
      category: 'Platos Principales',
      unitOfMeasure: 'unidad',
    },
    {
      name: 'Pasta Carbonara',
      description: 'Pasta con salsa carbonara y panceta',
      internalCode: 'P004',
      sku: 'SKU-004',
      category: 'Platos Principales',
      unitOfMeasure: 'porción',
    },
    {
      name: 'Ensalada César',
      description: 'Ensalada con pollo, crutones y aderezo César',
      internalCode: 'P005',
      sku: 'SKU-005',
      category: 'Entradas',
      unitOfMeasure: 'porción',
    },
    {
      name: 'Flan de Vainilla',
      description: 'Flan casero con caramelo',
      internalCode: 'P006',
      sku: 'SKU-006',
      category: 'Postres',
      unitOfMeasure: 'porción',
    },
    {
      name: 'Agua Mineral',
      description: 'Agua mineral sin gas 500ml',
      internalCode: 'P007',
      sku: 'SKU-007',
      category: 'Bebidas',
      unitOfMeasure: 'botella',
    },
  ]

  for (const product of productData) {
    try {
      const categoryId = categoryMap[product.category]

      if (!categoryId) {
        throw new Error(
          `Categoría no encontrada: ${product.category}`
        )
      }

      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          internalCode: product.internalCode,
          sku: product.sku,
          categoryId,
          companyId: company.id,
          isActive: true,
          unitOfMeasure: product.unitOfMeasure,
        },
      })
    } catch (error: any) {
      if (error.code !== 'P2002') {
        throw error
      }
    }
  }

  console.log('✅ 7 productos creados')

  // ==========================================================
  // 7. OBTENER PRODUCTOS
  // ==========================================================

  const products = await prisma.product.findMany({
    where: {
      companyId: company.id,
    },
  })

  const productMap: Record<string, string> = {}

  for (const product of products) {
    productMap[product.name] = product.id
  }

  // ==========================================================
  // 8. VARIANTES
  // ==========================================================

  const variantData = [
    {
      product: 'Café Americano',
      name: 'Default',
      value: 'Standard',
      price: 2.5,
      cost: 1.0,
      sku: 'VAR-001',
      stock: 100,
    },
    {
      product: 'Jugo de Naranja',
      name: 'Default',
      value: 'Standard',
      price: 3.0,
      cost: 1.5,
      sku: 'VAR-002',
      stock: 80,
    },
    {
      product: 'Hamburguesa Clásica',
      name: 'Default',
      value: 'Standard',
      price: 12.5,
      cost: 5.0,
      sku: 'VAR-003',
      stock: 50,
    },
    {
      product: 'Pasta Carbonara',
      name: 'Default',
      value: 'Standard',
      price: 14.0,
      cost: 6.0,
      sku: 'VAR-004',
      stock: 40,
    },
    {
      product: 'Ensalada César',
      name: 'Default',
      value: 'Standard',
      price: 8.5,
      cost: 3.5,
      sku: 'VAR-005',
      stock: 60,
    },
    {
      product: 'Flan de Vainilla',
      name: 'Default',
      value: 'Standard',
      price: 5.0,
      cost: 2.0,
      sku: 'VAR-006',
      stock: 70,
    },
    {
      product: 'Agua Mineral',
      name: 'Default',
      value: 'Standard',
      price: 1.5,
      cost: 0.5,
      sku: 'VAR-007',
      stock: 200,
    },
  ]

  for (const variant of variantData) {
    const productId = productMap[variant.product]

    if (!productId) {
      throw new Error(
        `Producto no encontrado: ${variant.product}`
      )
    }

    try {
      await prisma.variant.create({
        data: {
          productId,
          name: variant.name,
          value: variant.value,
          price: variant.price,
          cost: variant.cost,
          sku: variant.sku,
          stock: variant.stock,
        },
      })
    } catch (error: any) {
      if (error.code !== 'P2002') {
        throw error
      }
    }
  }

  console.log('✅ 7 variantes con precios creadas')

  // ==========================================================
  // 9. INGREDIENTES
  // ==========================================================

  const ingredientData = [
    {
      name: 'Carne para Hamburguesa',
      description: 'Carne de res para hamburguesas',
      unit: 'gramos',
    },
    {
      name: 'Pan de Hamburguesa',
      description: 'Pan para hamburguesa',
      unit: 'unidad',
    },
    {
      name: 'Queso',
      description: 'Queso para hamburguesa',
      unit: 'gramos',
    },
    {
      name: 'Lechuga',
      description: 'Lechuga fresca',
      unit: 'gramos',
    },
    {
      name: 'Tomate',
      description: 'Tomate fresco',
      unit: 'gramos',
    },
    {
      name: 'Pasta',
      description: 'Pasta para carbonara',
      unit: 'gramos',
    },
    {
      name: 'Panceta',
      description: 'Panceta para carbonara',
      unit: 'gramos',
    },
    {
      name: 'Huevo',
      description: 'Huevo fresco',
      unit: 'unidad',
    },
    {
      name: 'Queso Parmesano',
      description: 'Queso parmesano rallado',
      unit: 'gramos',
    },
  ]

  const ingredientMap: Record<string, string> = {}

  for (const ingredient of ingredientData) {
    const existing = await prisma.ingredient.findFirst({
      where: {
        name: ingredient.name,
        companyId: company.id,
      },
    })

    if (existing) {
      ingredientMap[ingredient.name] = existing.id
      console.log(`   ℹ️ Ingrediente existente: ${ingredient.name}`)
      continue
    }

    const created = await prisma.ingredient.create({
      data: {
        name: ingredient.name,
        description: ingredient.description,
        unit: ingredient.unit,
        isActive: true,
        companyId: company.id,
      },
    })

    ingredientMap[ingredient.name] = created.id
    console.log(`   ✅ Ingrediente creado: ${ingredient.name}`)
  }

  console.log(`✅ ${Object.keys(ingredientData).length} ingredientes creados`)

  // ==========================================================
  // 10. RECETAS
  // ==========================================================

  const recipeData = [
    {
      name: 'Hamburguesa Clásica',
      description:
        'Receta de hamburguesa con queso, lechuga y tomate',
      yield: 1,
      unit: 'unidad',
      prepTime: 15,
      instructions:
        'Cocinar la carne, montar la hamburguesa y servir.',
    },
    {
      name: 'Pasta Carbonara',
      description:
        'Receta tradicional de pasta carbonara',
      yield: 1,
      unit: 'porción',
      prepTime: 20,
      instructions:
        'Cocinar la pasta, preparar la salsa y mezclar.',
    },
  ]

  const recipeMap: Record<string, string> = {}

  for (const recipe of recipeData) {
    const existing = await prisma.recipe.findFirst({
      where: {
        name: recipe.name,
        companyId: company.id,
      },
    })

    if (existing) {
      recipeMap[recipe.name] = existing.id
      console.log(`   ℹ️ Receta existente: ${recipe.name}`)
      continue
    }

    const created = await prisma.recipe.create({
      data: {
        name: recipe.name,
        description: recipe.description,
        yield: recipe.yield,
        unit: recipe.unit,
        prepTime: recipe.prepTime,
        instructions: recipe.instructions,
        companyId: company.id,
        isActive: true,
      },
    })

    recipeMap[recipe.name] = created.id
    console.log(`   ✅ Receta creada: ${recipe.name}`)
  }

  console.log('✅ 2 recetas creadas')

  // ==========================================================
  // 11. INGREDIENTES DE RECETAS
  // ==========================================================

  const recipeIngredients = [
    {
      recipeName: 'Hamburguesa Clásica',
      ingredients: [
        { ingredientName: 'Carne para Hamburguesa', quantity: 150, unit: 'gramos' },
        { ingredientName: 'Pan de Hamburguesa', quantity: 1, unit: 'unidad' },
        { ingredientName: 'Queso', quantity: 30, unit: 'gramos' },
        { ingredientName: 'Lechuga', quantity: 30, unit: 'gramos' },
        { ingredientName: 'Tomate', quantity: 40, unit: 'gramos' },
      ],
    },
    {
      recipeName: 'Pasta Carbonara',
      ingredients: [
        { ingredientName: 'Pasta', quantity: 150, unit: 'gramos' },
        { ingredientName: 'Panceta', quantity: 80, unit: 'gramos' },
        { ingredientName: 'Huevo', quantity: 1, unit: 'unidad' },
        { ingredientName: 'Queso Parmesano', quantity: 30, unit: 'gramos' },
      ],
    },
  ]

  for (const recipeIngredient of recipeIngredients) {
    const recipeId = recipeMap[recipeIngredient.recipeName]

    if (!recipeId) {
      throw new Error(
        `Receta no encontrada: ${recipeIngredient.recipeName}`
      )
    }

    for (const item of recipeIngredient.ingredients) {
      const ingredientId = ingredientMap[item.ingredientName]

      if (!ingredientId) {
        throw new Error(
          `Ingrediente no encontrado: ${item.ingredientName}`
        )
      }

      try {
        await prisma.recipeIngredient.create({
          data: {
            recipeId,
            ingredientId,
            quantity: item.quantity,
            unit: item.unit,
            consumeInventory: true,
          },
        })
      } catch (error: any) {
        if (error.code !== 'P2002') {
          throw error
        }
      }
    }
  }

  console.log('✅ Ingredientes de recetas creados')

  // ==========================================================
  // 12. 🆕 ALÉRGENOS Y ETIQUETAS DIETÉTICAS
  // ==========================================================

  console.log('')
  console.log('🔴 Sembrando alérgenos...')

  const allergens = [
    { code: 'GLUTEN', name: 'Gluten', icon: '🌾', color: '#EF4444' },
    { code: 'MILK', name: 'Leche', icon: '🥛', color: '#3B82F6' },
    { code: 'EGG', name: 'Huevo', icon: '🥚', color: '#F59E0B' },
    { code: 'PEANUT', name: 'Maní', icon: '🥜', color: '#92400E' },
    { code: 'TREE_NUTS', name: 'Frutos secos', icon: '🌰', color: '#78350F' },
    { code: 'SOY', name: 'Soya', icon: '🫘', color: '#15803D' },
    { code: 'FISH', name: 'Pescado', icon: '🐟', color: '#2563EB' },
    { code: 'CRUSTACEANS', name: 'Crustáceos', icon: '🦐', color: '#DC2626' },
    { code: 'MOLLUSCS', name: 'Moluscos', icon: '🐚', color: '#7C3AED' },
    { code: 'CELERY', name: 'Apio', icon: '🌿', color: '#16A34A' },
    { code: 'MUSTARD', name: 'Mostaza', icon: '🟡', color: '#CA8A04' },
    { code: 'SESAME', name: 'Sésamo', icon: '🌱', color: '#78716C' },
    { code: 'SULPHITES', name: 'Sulfitos', icon: '⚠️', color: '#8B5CF6' },
    { code: 'LUPIN', name: 'Lupino', icon: '🌾', color: '#A3A3A3' },
  ]

  let allergensCreated = 0
  for (const allergen of allergens) {
    try {
      await prisma.allergen.upsert({
        where: { code: allergen.code },
        update: {},
        create: {
          code: allergen.code,
          name: allergen.name,
          icon: allergen.icon,
          color: allergen.color,
          isActive: true,
        },
      })
      allergensCreated++
      console.log(`   ✅ ${allergen.code}: ${allergen.name}`)
    } catch (error) {
      console.error(`   ❌ Error con ${allergen.code}:`, error)
    }
  }
  console.log(`✅ ${allergensCreated} alérgenos creados`)

  // ==========================================================
  // 13. 🆕 ETIQUETAS DIETÉTICAS
  // ==========================================================

  console.log('')
  console.log('🏷️ Sembrando etiquetas dietéticas...')

  const dietaryTags = [
    { code: 'VEGETARIAN', name: 'Vegetariano', icon: '🥬', color: '#22C55E' },
    { code: 'VEGAN', name: 'Vegano', icon: '🌱', color: '#15803D' },
    { code: 'GLUTEN_FREE', name: 'Sin gluten', icon: '🚫🌾', color: '#EF4444' },
    { code: 'LACTOSE_FREE', name: 'Sin lactosa', icon: '🚫🥛', color: '#3B82F6' },
    { code: 'HALAL', name: 'Halal', icon: '☪️', color: '#16A34A' },
    { code: 'KOSHER', name: 'Kosher', icon: '✡️', color: '#8B5CF6' },
    { code: 'LOW_SUGAR', name: 'Bajo en azúcar', icon: '🍬', color: '#F59E0B' },
  ]

  let tagsCreated = 0
  for (const tag of dietaryTags) {
    try {
      await prisma.dietaryTag.upsert({
        where: { code: tag.code },
        update: {},
        create: {
          code: tag.code,
          name: tag.name,
          icon: tag.icon,
          color: tag.color,
          isActive: true,
        },
      })
      tagsCreated++
      console.log(`   ✅ ${tag.code}: ${tag.name}`)
    } catch (error) {
      console.error(`   ❌ Error con ${tag.code}:`, error)
    }
  }
  console.log(`✅ ${tagsCreated} etiquetas dietéticas creadas`)

  // ==========================================================
  // 14. RESUMEN FINAL
  // ==========================================================

  const totalCompanies = await prisma.company.count()
  const totalUsers = await prisma.user.count()
  const totalTables = await prisma.table.count()
  const totalCategories = await prisma.category.count()
  const totalProducts = await prisma.product.count()
  const totalVariants = await prisma.variant.count()
  const totalIngredients = await prisma.ingredient.count()
  const totalRecipes = await prisma.recipe.count()
  const totalRecipeIngredients = await prisma.recipeIngredient.count()
  const totalAllergens = await prisma.allergen.count()
  const totalDietaryTags = await prisma.dietaryTag.count()

  console.log('')
  console.log('============================================')
  console.log('🎉 SEEDING COMPLETADO EXITOSAMENTE')
  console.log('============================================')
  console.log('')
  console.log(`🏢 Compañías:            ${totalCompanies}`)
  console.log(`👤 Usuarios:             ${totalUsers}`)
  console.log(`🍽️ Mesas:                ${totalTables}`)
  console.log(`📂 Categorías:           ${totalCategories}`)
  console.log(`📦 Productos:            ${totalProducts}`)
  console.log(`🏷️ Variantes:            ${totalVariants}`)
  console.log(`🥕 Ingredientes:         ${totalIngredients}`)
  console.log(`📖 Recetas:              ${totalRecipes}`)
  console.log(`🔗 Ingredientes receta:  ${totalRecipeIngredients}`)
  console.log(`🔴 Alérgenos:            ${totalAllergens}`)
  console.log(`🏷️ Etiquetas dietéticas: ${totalDietaryTags}`)
  console.log('')
}

// ============================================================
// EJECUCIÓN
// ============================================================

main()
  .catch((error) => {
    console.error('')
    console.error('============================================')
    console.error('❌ ERROR EN SEEDING')
    console.error('============================================')
    console.error('')
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
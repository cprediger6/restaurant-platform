// scripts/init-ingredients.ts

import { prisma } from '@/lib/db/prisma-client'

async function main() {
  console.log('🚀 Inicializando ingredientes y recetas...')

  const company = await prisma.company.findFirst()
  if (!company) {
    console.error('❌ No se encontró empresa')
    return
  }

  // 1. Crear ingredientes
  const ingredients = await prisma.ingredient.createMany({
    data: [
      {
        name: 'Medallón de Carne (Hamburguesa)',
        unit: 'unidad',
        conversionFactor: 1,
        companyId: company.id,
        productId: 'product-id-del-medallon' // Debes poner el ID real
      },
      {
        name: 'Pan de Hamburguesa',
        unit: 'unidad',
        conversionFactor: 1,
        companyId: company.id,
        productId: 'product-id-del-pan'
      },
      {
        name: 'Lechuga',
        unit: 'gramos',
        conversionFactor: 1,
        companyId: company.id,
        productId: 'product-id-de-lechuga'
      },
      {
        name: 'Tomate',
        unit: 'gramos',
        conversionFactor: 1,
        companyId: company.id,
        productId: 'product-id-de-tomate'
      },
      {
        name: 'Pepino',
        unit: 'gramos',
        conversionFactor: 1,
        companyId: company.id,
        productId: 'product-id-de-pepino'
      },
      {
        name: 'Tequila',
        unit: 'mililitros',
        conversionFactor: 1,
        companyId: company.id,
        productId: 'product-id-de-tequila'
      }
    ]
  })

  // 2. Obtener los IDs de los ingredientes creados
  const createdIngredients = await prisma.ingredient.findMany({
    where: { companyId: company.id },
    select: { id: true, name: true }
  })

  // 3. Crear receta de Hamburguesa
  const hamburgerRecipe = await prisma.recipe.create({
    data: {
      name: 'Hamburguesa Clásica',
      description: 'Hamburguesa con medallón de carne, pan, lechuga, tomate y pepino',
      yield: 1,
      unit: 'unidad',
      companyId: company.id,
      ingredients: {
        create: [
          {
            ingredientId: createdIngredients.find(i => i.name === 'Medallón de Carne (Hamburguesa)')!.id,
            quantity: 1,
            unit: 'unidad',
            consumeInventory: true
          },
          {
            ingredientId: createdIngredients.find(i => i.name === 'Pan de Hamburguesa')!.id,
            quantity: 1,
            unit: 'unidad',
            consumeInventory: true
          },
          {
            ingredientId: createdIngredients.find(i => i.name === 'Lechuga')!.id,
            quantity: 50,
            unit: 'gramos',
            consumeInventory: true
          },
          {
            ingredientId: createdIngredients.find(i => i.name === 'Tomate')!.id,
            quantity: 30,
            unit: 'gramos',
            consumeInventory: true
          },
          {
            ingredientId: createdIngredients.find(i => i.name === 'Pepino')!.id,
            quantity: 20,
            unit: 'gramos',
            consumeInventory: true
          }
        ]
      }
    }
  })

  // 4. Crear receta de Tequila (shot)
  const tequilaRecipe = await prisma.recipe.create({
    data: {
      name: 'Shot de Tequila',
      description: 'Un shot de tequila (44.36 ml)',
      yield: 1,
      unit: 'shot',
      companyId: company.id,
      ingredients: {
        create: [
          {
            ingredientId: createdIngredients.find(i => i.name === 'Tequila')!.id,
            quantity: 44.36,
            unit: 'mililitros',
            consumeInventory: true
          }
        ]
      }
    }
  })

  console.log('✅ Recetas creadas:')
  console.log(`   - Hamburguesa Clásica: ${hamburgerRecipe.id}`)
  console.log(`   - Shot de Tequila: ${tequilaRecipe.id}`)

  // 5. Asignar recetas a productos existentes
  // Encuentra los productos y asígnales la receta
  const products = await prisma.product.findMany({
    where: { companyId: company.id },
    take: 5
  })

  for (const product of products) {
    if (product.name.toLowerCase().includes('hamburguesa')) {
      await prisma.product.update({
        where: { id: product.id },
        data: { recipeId: hamburgerRecipe.id }
      })
      console.log(`   ✅ Producto "${product.name}" -> Receta Hamburguesa`)
    } else if (product.name.toLowerCase().includes('tequila')) {
      await prisma.product.update({
        where: { id: product.id },
        data: { recipeId: tequilaRecipe.id }
      })
      console.log(`   ✅ Producto "${product.name}" -> Receta Tequila`)
    }
  }

  console.log('✅ Inicialización completada')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
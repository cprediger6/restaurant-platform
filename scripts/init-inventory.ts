// scripts/init-inventory.ts

import { prisma } from '../src/lib/db/prisma-client'

async function main() {
  console.log('🚀 Inicializando inventario...')

  try {
    // Verificar conexión
    await prisma.$connect()
    console.log('✅ Conectado a la base de datos')

    // Obtener primera empresa
    const company = await prisma.company.findFirst()
    if (!company) {
      console.error('❌ No se encontró ninguna empresa')
      return
    }
    console.log(`📋 Empresa encontrada: ${company.name}`)

    // Obtener primera bodega
    const warehouse = await prisma.warehouse.findFirst({
      where: { companyId: company.id }
    })
    if (!warehouse) {
      console.error('❌ No se encontró ninguna bodega')
      return
    }
    console.log(`📦 Bodega encontrada: ${warehouse.name}`)

    // Obtener productos sin inventario
    const products = await prisma.product.findMany({
      where: {
        companyId: company.id,
        isActive: true
      },
      include: {
        variants: true
      },
      take: 10 // Limitar para prueba
    })

    console.log(`📦 Encontrados ${products.length} productos`)

    let created = 0
    let skipped = 0

    for (const product of products) {
      // Verificar si ya existe inventario para este producto
      const existing = await prisma.inventoryItem.findFirst({
        where: {
          productId: product.id,
          warehouseId: warehouse.id,
          variantId: null
        }
      })

      if (existing) {
        console.log(`⏭️ Producto ${product.name} ya tiene inventario`)
        skipped++
        continue
      }

      // Crear inventario para el producto
      await prisma.inventoryItem.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          currentStock: 0,
          availableStock: 0,
          reservedStock: 0,
          transitStock: 0,
          minStock: 10,
          maxStock: 100,
          reorderPoint: 20,
          costMethod: 'FIFO'
        }
      })
      created++
      console.log(`✅ Inventario creado para: ${product.name}`)

      // Crear inventario para cada variante
      for (const variant of product.variants) {
        const existingVariant = await prisma.inventoryItem.findFirst({
          where: {
            productId: product.id,
            variantId: variant.id,
            warehouseId: warehouse.id
          }
        })

        if (existingVariant) {
          console.log(`⏭️ Variante ${variant.name} ya tiene inventario`)
          continue
        }

        await prisma.inventoryItem.create({
          data: {
            productId: product.id,
            variantId: variant.id,
            warehouseId: warehouse.id,
            currentStock: 0,
            availableStock: 0,
            reservedStock: 0,
            transitStock: 0,
            minStock: 5,
            maxStock: 50,
            reorderPoint: 10,
            costMethod: 'FIFO'
          }
        })
        created++
        console.log(`✅ Inventario creado para variante: ${variant.name}`)
      }
    }

    console.log(`\n📊 Resumen:`)
    console.log(`   ✅ Items creados: ${created}`)
    console.log(`   ⏭️ Items omitidos: ${skipped}`)
    console.log(`   📦 Total productos procesados: ${products.length}`)

    // Mostrar estadísticas
    const totalItems = await prisma.inventoryItem.count({
      where: { warehouseId: warehouse.id }
    })
    console.log(`   📊 Total items en inventario: ${totalItems}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
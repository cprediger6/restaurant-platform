import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Verificando modelos de Prisma...')
    
    // Verificar si OrderAudit existe
    console.log('📋 Verificando modelo OrderAudit...')
    const auditCount = await prisma.orderAudit.count()
    console.log(`✅ Modelo OrderAudit existe. Total registros: ${auditCount}`)
    
    // Verificar otros modelos relacionados
    console.log('📋 Verificando modelo DinerAllergy...')
    const allergyCount = await prisma.dinerAllergy.count()
    console.log(`✅ Modelo DinerAllergy existe. Total registros: ${allergyCount}`)
    
    // Verificar modelos principales
    console.log('📋 Verificando modelo Order...')
    const orderCount = await prisma.order.count()
    console.log(`✅ Modelo Order existe. Total registros: ${orderCount}`)
    
    console.log('✅ Todos los modelos están disponibles')
  } catch (error) {
    console.error('❌ Error:', error)
    if (error instanceof Error) {
      console.error('Mensaje:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()

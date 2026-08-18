// scripts/create-system-user.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Verificando usuario system...')
    
    // Buscar una empresa existente
    const company = await prisma.company.findFirst()
    if (!company) {
      console.error('❌ No se encontró ninguna empresa')
      return
    }
    console.log(`📋 Empresa encontrada: ${company.id} - ${company.name}`)

    // Verificar si el usuario system ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'system@restaurant.com' }
    })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('system123', 10)
      await prisma.user.create({
        data: {
          id: 'system',
          email: 'system@restaurant.com',
          password: hashedPassword,
          name: 'Sistema',
          lastName: 'Restaurant',
          role: 'ADMIN',
          companyId: company.id,
          isActive: true
        }
      })
      console.log('✅ Usuario system creado')
    } else {
      console.log('✅ Usuario system ya existe')
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { email: 'system@restaurant.com' }
    })
    console.log(`📋 ID del usuario system: ${user?.id}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
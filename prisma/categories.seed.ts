// prisma/seeds/categories.seed.ts

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
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
// CATEGORÍAS
// ============================================================

const categoryData = [
  {
    name: 'Carnes',
    description: 'Carnes de res, cerdo, cordero y otras carnes frescas',
  },
  {
    name: 'Aves',
    description: 'Pollo, pavo, pato y otras aves',
  },
  {
    name: 'Pescados',
    description: 'Pescados frescos y congelados',
  },
  {
    name: 'Mariscos',
    description:
      'Camarones, langosta, cangrejo, pulpo, calamar y otros mariscos',
  },
  {
    name: 'Embutidos y Carnes Procesadas',
    description:
      'Jamón, salami, chorizo, tocino y otros productos procesados',
  },
  {
    name: 'Lácteos',
    description: 'Leche, quesos, crema, yogur, mantequilla y derivados',
  },
  {
    name: 'Huevos',
    description: 'Huevos frescos y productos derivados',
  },
  {
    name: 'Frutas',
    description: 'Frutas frescas y procesadas',
  },
  {
    name: 'Vegetales y Hortalizas',
    description: 'Vegetales, verduras y hortalizas frescas',
  },
  {
    name: 'Tubérculos y Raíces',
    description: 'Papa, yuca, ñame, camote y otros tubérculos',
  },
  {
    name: 'Granos y Cereales',
    description: 'Arroz, trigo, maíz, avena y otros cereales',
  },
  {
    name: 'Harinas',
    description: 'Harina de trigo, maíz, arroz y otras harinas',
  },
  {
    name: 'Pastas',
    description: 'Pastas secas, frescas y productos similares',
  },
  {
    name: 'Legumbres',
    description: 'Frijoles, lentejas, garbanzos y otras legumbres',
  },
  {
    name: 'Panadería y Repostería',
    description:
      'Pan, tortillas, masas, productos de repostería y panadería',
  },
  {
    name: 'Aceites y Grasas',
    description: 'Aceites vegetales, aceite de oliva, manteca y otras grasas',
  },
  {
    name: 'Salsas y Aderezos',
    description: 'Mayonesa, ketchup, mostaza, BBQ, aderezos y salsas',
  },
  {
    name: 'Especias y Condimentos',
    description: 'Sal, pimienta, especias y sazonadores',
  },
  {
    name: 'Hierbas Aromáticas',
    description:
      'Albahaca, cilantro, perejil, romero y otras hierbas aromáticas',
  },
  {
    name: 'Conservas y Enlatados',
    description:
      'Productos enlatados, conservas, aceitunas y productos similares',
  },
  {
    name: 'Productos Congelados',
    description:
      'Alimentos congelados y productos preparados congelados',
  },
  {
    name: 'Productos Refrigerados',
    description: 'Productos que requieren almacenamiento refrigerado',
  },
  {
    name: 'Frutos Secos y Semillas',
    description:
      'Almendras, nueces, maní, sésamo y otras semillas',
  },
  {
    name: 'Azúcares y Endulzantes',
    description: 'Azúcar, miel, stevia y otros endulzantes',
  },
  {
    name: 'Chocolate y Cacao',
    description: 'Chocolate, cacao y productos derivados',
  },
  {
    name: 'Café y Té',
    description: 'Café, té, infusiones y productos relacionados',
  },
  {
    name: 'Bebidas',
    description:
      'Agua, refrescos, jugos y bebidas no alcohólicas',
  },
  {
    name: 'Bebidas Alcohólicas',
    description:
      'Cervezas, vinos, licores y otras bebidas alcohólicas',
  },
  {
    name: 'Productos Vegetarianos y Veganos',
    description:
      'Tofu, proteínas vegetales y otros productos vegetarianos o veganos',
  },
  {
    name: 'Productos Sin Gluten',
    description:
      'Productos certificados o formulados sin gluten',
  },
  {
    name: 'Productos de Limpieza',
    description:
      'Detergentes, desinfectantes, limpiadores y productos de limpieza',
  },
  {
    name: 'Desechables',
    description:
      'Vasos, platos, cubiertos, servilletas y otros desechables',
  },
  {
    name: 'Empaques y Delivery',
    description:
      'Cajas, bolsas, recipientes, envases y productos para delivery',
  },
  {
    name: 'Productos de Higiene',
    description:
      'Jabón, papel sanitario, toallas y productos de higiene',
  },
  {
    name: 'Suministros de Cocina',
    description:
      'Papel aluminio, film, papel para hornear y otros suministros',
  },
  {
    name: 'Otros',
    description:
      'Productos que no pertenecen a ninguna categoría específica',
  },
]

// ============================================================
// SEED
// ============================================================

async function main() {
  console.log('')
  console.log('============================================')
  console.log('📂 SEED DE CATEGORÍAS')
  console.log('============================================')
  console.log('')

  // ----------------------------------------------------------
  // Obtener compañía
  // ----------------------------------------------------------

  const company = await prisma.company.findUnique({
    where: {
      ruc: '123456789',
    },
  })

  if (!company) {
    throw new Error(
      '❌ No se encontró la compañía con RUC 123456789'
    )
  }

  console.log(`🏢 Compañía: ${company.name}`)
  console.log('')

  // ----------------------------------------------------------
  // Crear categorías
  // ----------------------------------------------------------

  let created = 0
  let existing = 0

  for (const category of categoryData) {
    const categoryExists = await prisma.category.findFirst({
      where: {
        name: category.name,
        companyId: company.id,
      },
    })

    if (categoryExists) {
      console.log(`   ℹ️ Ya existe: ${category.name}`)
      existing++
      continue
    }

    await prisma.category.create({
      data: {
        name: category.name,
        description: category.description,
        companyId: company.id,
      },
    })

    console.log(`   ✅ Creada: ${category.name}`)
    created++
  }

  // ----------------------------------------------------------
  // Resumen
  // ----------------------------------------------------------

  console.log('')
  console.log('============================================')
  console.log('🎉 SEED DE CATEGORÍAS COMPLETADO')
  console.log('============================================')
  console.log(`✅ Categorías creadas: ${created}`)
  console.log(`ℹ️ Categorías existentes: ${existing}`)
  console.log(`📊 Total procesadas: ${categoryData.length}`)
  console.log('')
}

// ============================================================
// EJECUCIÓN
// ============================================================

main()
  .catch((error) => {
    console.error('')
    console.error('============================================')
    console.error('❌ ERROR EN SEED DE CATEGORÍAS')
    console.error('============================================')
    console.error('')
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
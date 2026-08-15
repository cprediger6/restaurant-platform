// prisma/seed-allergens.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando alérgenos y etiquetas dietéticas...')

  // ============================================================
  // ALÉRGENOS
  // ============================================================
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

  for (const allergen of allergens) {
    await prisma.allergen.upsert({
      where: { code: allergen.code },
      update: {},
      create: allergen
    })
  }
  console.log(`✅ ${allergens.length} alérgenos creados`)

  // ============================================================
  // ETIQUETAS DIETÉTICAS
  // ============================================================
  const dietaryTags = [
    { code: 'VEGETARIAN', name: 'Vegetariano', icon: '🥬', color: '#22C55E' },
    { code: 'VEGAN', name: 'Vegano', icon: '🌱', color: '#15803D' },
    { code: 'GLUTEN_FREE', name: 'Sin gluten', icon: '🚫🌾', color: '#EF4444' },
    { code: 'LACTOSE_FREE', name: 'Sin lactosa', icon: '🚫🥛', color: '#3B82F6' },
    { code: 'HALAL', name: 'Halal', icon: '☪️', color: '#16A34A' },
    { code: 'KOSHER', name: 'Kosher', icon: '✡️', color: '#8B5CF6' },
    { code: 'LOW_SUGAR', name: 'Bajo en azúcar', icon: '🍬', color: '#F59E0B' },
  ]

  for (const tag of dietaryTags) {
    await prisma.dietaryTag.upsert({
      where: { code: tag.code },
      update: {},
      create: tag
    })
  }
  console.log(`✅ ${dietaryTags.length} etiquetas dietéticas creadas`)

  console.log('🌱 ¡Seed completado!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
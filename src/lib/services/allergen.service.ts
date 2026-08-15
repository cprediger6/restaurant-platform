// src/lib/services/allergen.service.ts

import 'server-only'
import { prisma } from '@/lib/db/prisma-client'

export class AllergenService {
  // ============================================================
  // CALCULAR ALÉRGENOS DE UN MENU ITEM
  // ============================================================
  async calculateMenuItemAllergens(menuItemId: string) {
    // 1. Obtener el menu item con su receta e ingredientes
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: {
                  include: {
                    allergens: {
                      include: {
                        allergen: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!menuItem) {
      throw new Error('Menu item no encontrado')
    }

    // Si no tiene receta, no hay alérgenos que calcular
    if (!menuItem.recipe) {
      return []
    }

    // 2. Recolectar todos los alérgenos de los ingredientes
    const allergenMap = new Map<string, { allergen: any; sources: string[] }>()

    for (const recipeIngredient of menuItem.recipe.ingredients) {
      const ingredient = recipeIngredient.ingredient
      
      for (const ingredientAllergen of ingredient.allergens) {
        const allergen = ingredientAllergen.allergen
        const allergenId = allergen.id
        
        if (allergenMap.has(allergenId)) {
          const existing = allergenMap.get(allergenId)!
          existing.sources.push(ingredient.name)
        } else {
          allergenMap.set(allergenId, {
            allergen,
            sources: [ingredient.name]
          })
        }
      }
    }

    // 3. Guardar los alérgenos calculados en MenuItemAllergen
    const results = []
    for (const [allergenId, data] of allergenMap) {
      const result = await prisma.menuItemAllergen.upsert({
        where: {
          menuItemId_allergenId: {
            menuItemId,
            allergenId
          }
        },
        update: {
          source: `Ingredientes: ${data.sources.join(', ')}`
        },
        create: {
          menuItemId,
          allergenId,
          source: `Ingredientes: ${data.sources.join(', ')}`
        }
      })
      results.push(result)
    }

    return results
  }

  // ============================================================
  // OBTENER ALÉRGENOS DE UN MENU ITEM
  // ============================================================
  async getMenuItemAllergens(menuItemId: string) {
    return await prisma.menuItemAllergen.findMany({
      where: { menuItemId },
      include: {
        allergen: true
      }
    })
  }

  // ============================================================
  // VERIFICAR COMPATIBILIDAD CON RESTRICCIONES
  // ============================================================
  async checkMenuItemCompatibility(
    menuItemId: string,
    restrictions: string[] // Lista de códigos de alérgenos a evitar
  ) {
    const allergens = await this.getMenuItemAllergens(menuItemId)
    const allergenCodes = allergens.map(a => a.allergen.code)
    
    // Verificar contaminación cruzada
    const crossContamination = await prisma.crossContamination.findMany({
      where: { menuItemId },
      include: { allergen: true }
    })
    const crossContaminationCodes = crossContamination.map(c => c.allergen.code)

    // Combinar todos los riesgos
    const allRisks = [...allergenCodes, ...crossContaminationCodes]
    
    // Verificar si hay conflicto con las restricciones
    const conflicts = restrictions.filter(r => allRisks.includes(r))

    return {
      isCompatible: conflicts.length === 0,
      conflicts,
      allergens: allergenCodes,
      crossContamination: crossContaminationCodes,
      hasCrossContamination: crossContaminationCodes.length > 0
    }
  }
}
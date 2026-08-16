// src/lib/services/inventory.service.ts

import 'server-only'
import { prisma } from '@/lib/db/prisma-client'
import { 
  MovementType, 
  CostMethod,
  Prisma
} from '@prisma/client'

// Definir tipos auxiliares
interface StockDetail {
  inventoryItemId: string
  warehouseId: string
  warehouseName: string
  currentStock: number
  availableStock: number
  lastCost: number | null
  averageCost: number | null
}

interface IngredientStock {
  ingredientId: string
  ingredientName: string
  productId: string | null
  requiredQuantity: number
  unit: string
  totalStock: number
  isAvailable: boolean
  stockDetails: StockDetail[]
}

interface RecipeStock {
  recipeName: string
  ingredients: IngredientStock[]
  allAvailable: boolean
}

interface CompanyStockItem {
  productId: string
  productName: string
  sku: string
  variantName: string | null
  warehouseName: string
  currentStock: number
  availableStock: number
  lastCost: number | null
  totalValue: number
}

interface CompanyStockSummary {
  totalItems: number
  totalValue: number
  items: CompanyStockItem[]
}

export class InventoryService {
  // ============================================================
  // GESTIÓN DE ITEMS DE INVENTARIO
  // ============================================================

  async getInventoryItems(warehouseId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit
    
    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: { warehouseId },
        include: {
          product: {
            include: {
              category: true,
              subcategory: true
            }
          },
          variant: true,
          location: true,
          warehouse: true
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.inventoryItem.count({ where: { warehouseId } })
    ])

    return { items, total, page, totalPages: Math.ceil(total / limit) }
  }

  async getInventoryByProduct(productId: string) {
    return await prisma.inventoryItem.findMany({
      where: { productId },
      include: {
        warehouse: true,
        location: true,
        variant: true
      }
    })
  }

  async getInventoryByVariant(variantId: string) {
    return await prisma.inventoryItem.findFirst({
      where: { variantId },
      include: {
        product: true,
        warehouse: true,
        location: true
      }
    })
  }

  async upsertInventoryItem(data: {
    productId: string
    variantId?: string
    warehouseId: string
    locationId?: string
    minStock?: number
    maxStock?: number
    reorderPoint?: number
    costMethod?: CostMethod
    standardCost?: number
  }) {
    const { productId, variantId, warehouseId, ...rest } = data

    const existing = await prisma.inventoryItem.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        warehouseId
      }
    })

    if (existing) {
      return await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: rest
      })
    }

    return await prisma.inventoryItem.create({
      data: {
        productId,
        variantId,
        warehouseId,
        currentStock: 0,
        availableStock: 0,
        reservedStock: 0,
        transitStock: 0,
        ...rest
      },
      include: {
        product: true,
        variant: true,
        warehouse: true
      }
    })
  }

  // ============================================================
  // MOVIMIENTOS DE INVENTARIO
  // ============================================================

  async registerEntry(data: {
    productId: string
    variantId?: string
    warehouseId: string
    quantity: number
    unitCost: number
    reference?: string
    description?: string
    userId: string
  }) {
    const { productId, variantId, warehouseId, quantity, unitCost, reference, description, userId } = data

    let inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        warehouseId
      }
    })

    if (!inventoryItem) {
      inventoryItem = await this.upsertInventoryItem({
        productId,
        variantId,
        warehouseId,
        costMethod: CostMethod.FIFO
      })
    }

    const totalCost = quantity * unitCost

    const movement = await prisma.inventoryMovement.create({
      data: {
        type: MovementType.IN,
        quantity,
        unitCost,
        totalCost,
        reference,
        description,
        inventoryItemId: inventoryItem.id,
        userId
      }
    })

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        currentStock: { increment: quantity },
        availableStock: { increment: quantity },
        lastCost: unitCost,
        averageCost: this.calculateAverageCost(inventoryItem, quantity, unitCost)
      }
    })

    await this.createKardexEntry({
      inventoryItemId: inventoryItem.id,
      movementId: movement.id,
      quantityIn: quantity,
      quantityOut: 0,
      balance: updatedItem.currentStock,
      unitCost,
      totalCost,
      balanceCost: updatedItem.currentStock * unitCost
    })

    return { movement, inventoryItem: updatedItem }
  }

  async registerExit(data: {
    productId: string
    variantId?: string
    warehouseId: string
    quantity: number
    unitCost?: number
    reference?: string
    description?: string
    userId: string
  }) {
    const { productId, variantId, warehouseId, quantity, reference, description, userId } = data

    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        warehouseId
      }
    })

    if (!inventoryItem) {
      throw new Error('Item de inventario no encontrado')
    }

    if (inventoryItem.currentStock < quantity) {
      throw new Error(`Stock insuficiente. Disponible: ${inventoryItem.currentStock}, Solicitado: ${quantity}`)
    }

    const unitCost = await this.getCostByMethod(inventoryItem.id, inventoryItem.costMethod)
    const totalCost = quantity * unitCost

    const movement = await prisma.inventoryMovement.create({
      data: {
        type: MovementType.OUT,
        quantity,
        unitCost,
        totalCost,
        reference,
        description,
        inventoryItemId: inventoryItem.id,
        userId
      }
    })

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        currentStock: { decrement: quantity },
        availableStock: { decrement: quantity }
      }
    })

    await this.createKardexEntry({
      inventoryItemId: inventoryItem.id,
      movementId: movement.id,
      quantityIn: 0,
      quantityOut: quantity,
      balance: updatedItem.currentStock,
      unitCost,
      totalCost,
      balanceCost: updatedItem.currentStock * unitCost
    })

    return { movement, inventoryItem: updatedItem }
  }

  async registerAdjustment(data: {
    productId: string
    variantId?: string
    warehouseId: string
    quantity: number
    reason: string
    userId: string
  }) {
    const { productId, variantId, warehouseId, quantity, reason, userId } = data

    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        warehouseId
      }
    })

    if (!inventoryItem) {
      throw new Error('Item de inventario no encontrado')
    }

    const newStock = inventoryItem.currentStock + quantity

    if (newStock < 0) {
      throw new Error(`Ajuste resultaría en stock negativo. Actual: ${inventoryItem.currentStock}, Ajuste: ${quantity}`)
    }

    const movement = await prisma.inventoryMovement.create({
      data: {
        type: MovementType.ADJUSTMENT,
        quantity: Math.abs(quantity),
        unitCost: inventoryItem.lastCost || 0,
        totalCost: Math.abs(quantity) * (inventoryItem.lastCost || 0),
        reference: `AJUSTE-${Date.now()}`,
        description: reason,
        inventoryItemId: inventoryItem.id,
        userId
      }
    })

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        currentStock: newStock,
        availableStock: newStock
      }
    })

    await this.createKardexEntry({
      inventoryItemId: inventoryItem.id,
      movementId: movement.id,
      quantityIn: quantity > 0 ? quantity : 0,
      quantityOut: quantity < 0 ? Math.abs(quantity) : 0,
      balance: newStock,
      unitCost: inventoryItem.lastCost || 0,
      totalCost: Math.abs(quantity) * (inventoryItem.lastCost || 0),
      balanceCost: newStock * (inventoryItem.lastCost || 0)
    })

    return { movement, inventoryItem: updatedItem }
  }

  async registerTransfer(data: {
    productId: string
    variantId?: string
    sourceWarehouseId: string
    targetWarehouseId: string
    quantity: number
    userId: string
    notes?: string
  }) {
    const { 
      productId, 
      variantId, 
      sourceWarehouseId, 
      targetWarehouseId, 
      quantity, 
      userId,
      notes 
    } = data

    const sourceItem = await prisma.inventoryItem.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        warehouseId: sourceWarehouseId
      }
    })

    if (!sourceItem) {
      throw new Error('Item de inventario no encontrado en bodega origen')
    }

    if (sourceItem.currentStock < quantity) {
      throw new Error(`Stock insuficiente en bodega origen. Disponible: ${sourceItem.currentStock}`)
    }

    let targetItem = await prisma.inventoryItem.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        warehouseId: targetWarehouseId
      }
    })

    if (!targetItem) {
      targetItem = await this.upsertInventoryItem({
        productId,
        variantId,
        warehouseId: targetWarehouseId,
        costMethod: CostMethod.FIFO
      })
    }

    const movement = await prisma.inventoryMovement.create({
      data: {
        type: MovementType.TRANSFER,
        quantity,
        unitCost: sourceItem.lastCost || 0,
        totalCost: quantity * (sourceItem.lastCost || 0),
        reference: `TRANS-${Date.now()}`,
        description: notes || `Transferencia de ${sourceWarehouseId} a ${targetWarehouseId}`,
        inventoryItemId: sourceItem.id,
        sourceWarehouseId,
        targetWarehouseId,
        userId
      }
    })

    await prisma.inventoryItem.update({
      where: { id: sourceItem.id },
      data: {
        currentStock: { decrement: quantity },
        availableStock: { decrement: quantity }
      }
    })

    await prisma.inventoryItem.update({
      where: { id: targetItem.id },
      data: {
        currentStock: { increment: quantity },
        availableStock: { increment: quantity }
      }
    })

    const updatedSource = await prisma.inventoryItem.findUnique({
      where: { id: sourceItem.id }
    })

    await this.createKardexEntry({
      inventoryItemId: sourceItem.id,
      movementId: movement.id,
      quantityIn: 0,
      quantityOut: quantity,
      balance: updatedSource?.currentStock || 0,
      unitCost: sourceItem.lastCost || 0,
      totalCost: quantity * (sourceItem.lastCost || 0),
      balanceCost: (updatedSource?.currentStock || 0) * (sourceItem.lastCost || 0)
    })

    return { movement, sourceItem, targetItem }
  }

  // ============================================================
  // MÉTODOS DE CÁLCULO DE COSTOS
  // ============================================================

  private calculateAverageCost(inventoryItem: any, newQuantity: number, newUnitCost: number): number {
    const currentStock = inventoryItem.currentStock || 0
    const currentCost = inventoryItem.averageCost || 0
    
    if (currentStock === 0) {
      return newUnitCost
    }
    
    return ((currentStock * currentCost) + (newQuantity * newUnitCost)) / (currentStock + newQuantity)
  }

  private async getCostByMethod(inventoryItemId: string, method: CostMethod): Promise<number> {
    switch (method) {
      case CostMethod.FIFO:
        return await this.getFIFOCost(inventoryItemId)
      case CostMethod.LIFO:
        return await this.getLIFOCost(inventoryItemId)
      case CostMethod.AVERAGE:
        return await this.getAverageCost(inventoryItemId)
      case CostMethod.STANDARD:
        return await this.getStandardCost(inventoryItemId)
      default:
        return 0
    }
  }

  private async getFIFOCost(inventoryItemId: string): Promise<number> {
    const entries = await prisma.$queryRaw`
      SELECT * FROM kardex 
      WHERE "inventoryItemId" = ${inventoryItemId} 
      AND "quantityIn" > 0
      ORDER BY date ASC
      LIMIT 1
    `
    
    if (Array.isArray(entries) && entries.length > 0) {
      return Number((entries[0] as any).unitCost)
    }
    
    return 0
  }

  private async getLIFOCost(inventoryItemId: string): Promise<number> {
    const entries = await prisma.$queryRaw`
      SELECT * FROM kardex 
      WHERE "inventoryItemId" = ${inventoryItemId} 
      AND "quantityIn" > 0
      ORDER BY date DESC
      LIMIT 1
    `
    
    if (Array.isArray(entries) && entries.length > 0) {
      return Number((entries[0] as any).unitCost)
    }
    
    return 0
  }

  private async getAverageCost(inventoryItemId: string): Promise<number> {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId }
    })
    
    return item?.averageCost || 0
  }

  private async getStandardCost(inventoryItemId: string): Promise<number> {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId }
    })
    
    return item?.standardCost || 0
  }

  // ============================================================
  // KARDEX
  // ============================================================

  private async createKardexEntry(data: {
    inventoryItemId: string
    movementId: string
    quantityIn: number
    quantityOut: number
    balance: number
    unitCost: number
    totalCost: number
    balanceCost: number
  }) {
    return await prisma.kardex.create({
      data: {
        inventoryItemId: data.inventoryItemId,
        movementId: data.movementId,
        quantityIn: data.quantityIn,
        quantityOut: data.quantityOut,
        balance: data.balance,
        unitCost: data.unitCost,
        totalCost: data.totalCost,
        balanceCost: data.balanceCost
      }
    })
  }

  async getKardex(productId: string, warehouseId?: string) {
    const where: any = {
      inventoryItem: {
        productId
      }
    }

    if (warehouseId) {
      where.inventoryItem.warehouseId = warehouseId
    }

    return await prisma.kardex.findMany({
      where,
      include: {
        inventoryItem: {
          include: {
            product: true,
            variant: true,
            warehouse: true
          }
        },
        movement: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    })
  }

  // ============================================================
  // REPORTES Y ESTADÍSTICAS
  // ============================================================

  async getLowStockItems(companyId: string) {
    return await prisma.inventoryItem.findMany({
      where: {
        warehouse: {
          companyId
        },
        currentStock: {
          lte: prisma.inventoryItem.fields.reorderPoint
        }
      },
      include: {
        product: true,
        variant: true,
        warehouse: true
      },
      orderBy: { currentStock: 'asc' }
    })
  }

  async getInventoryValue(companyId: string) {
    const items = await prisma.inventoryItem.findMany({
      where: {
        warehouse: {
          companyId
        }
      },
      include: {
        product: true,
        variant: true
      }
    })

    let totalValue = 0
    for (const item of items) {
      const cost = item.averageCost || item.lastCost || 0
      totalValue += item.currentStock * cost
    }

    return totalValue
  }

  async getTopSellingProducts(companyId: string, limit: number = 10) {
    return await prisma.$queryRaw`
      SELECT 
        p.id,
        p.name,
        p.sku,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue
      FROM products p
      JOIN order_items oi ON oi."productId" = p.id
      JOIN orders o ON o.id = oi."orderId"
      WHERE p."companyId" = ${companyId}
      AND o.status != 'CANCELLED'
      GROUP BY p.id, p.name, p.sku
      ORDER BY total_sold DESC
      LIMIT ${limit}
    `
  }

  // ============================================================
  // CONCILIACIÓN DE INVENTARIO
  // ============================================================

  async physicalCount(data: {
    productId: string
    variantId?: string
    warehouseId: string
    physicalCount: number
    userId: string
    notes?: string
  }) {
    const { productId, variantId, warehouseId, physicalCount, userId, notes } = data

    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        warehouseId
      }
    })

    if (!inventoryItem) {
      throw new Error('Item de inventario no encontrado')
    }

    const difference = physicalCount - inventoryItem.currentStock

    if (difference !== 0) {
      await this.registerAdjustment({
        productId,
        variantId,
        warehouseId,
        quantity: difference,
        reason: notes || `Conteo físico: esperado ${inventoryItem.currentStock}, encontrado ${physicalCount}`,
        userId
      })
    }

    // Registrar conteo usando raw query porque el modelo InventoryCount aún no existe
    await prisma.$executeRaw`
      INSERT INTO inventory_counts (
        "inventoryItemId",
        "expectedCount",
        "physicalCount",
        "difference",
        "userId",
        "notes",
        "createdAt"
      ) VALUES (
        ${inventoryItem.id},
        ${inventoryItem.currentStock},
        ${physicalCount},
        ${difference},
        ${userId},
        ${notes || null},
        NOW()
      )
    `

    return {
      inventoryItem,
      expected: inventoryItem.currentStock,
      physical: physicalCount,
      difference
    }
  }

  // ============================================================
  // VALIDACIONES
  // ============================================================

  async checkAvailability(productId: string, quantity: number, warehouseId: string, variantId?: string) {
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        warehouseId
      }
    })

    if (!inventoryItem) {
      return {
        available: false,
        message: 'Producto no encontrado en inventario',
        currentStock: 0,
        requested: quantity
      }
    }

    const available = inventoryItem.availableStock >= quantity

    return {
      available,
      message: available ? 'Stock disponible' : 'Stock insuficiente',
      currentStock: inventoryItem.currentStock,
      availableStock: inventoryItem.availableStock,
      requested: quantity,
      difference: inventoryItem.availableStock - quantity
    }
  }

  // ============================================================
  // NUEVO: CONSULTAR STOCK DE UN PRODUCTO (para ingredientes)
  // ============================================================
  async getProductStock(productId: string) {
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        productId,
        currentStock: { gt: 0 }
      },
      include: {
        warehouse: true
      },
      orderBy: { createdAt: 'asc' }
    })

    const totalStock = inventoryItems.reduce((sum: number, item: any) => sum + item.currentStock, 0)

    const items: StockDetail[] = inventoryItems.map((item: any) => ({
      inventoryItemId: item.id,
      warehouseId: item.warehouseId,
      warehouseName: item.warehouse?.name || 'Bodega desconocida',
      currentStock: item.currentStock,
      availableStock: item.availableStock,
      lastCost: item.lastCost,
      averageCost: item.averageCost
    }))

    return {
      productId,
      totalStock,
      items
    }
  }

  // ============================================================
  // NUEVO: OBTENER STOCK DE INGREDIENTES PARA UNA RECETA
  // ============================================================
  async getRecipeIngredientsStock(recipeId: string): Promise<RecipeStock> {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: {
            ingredient: {
              include: {
                product: {
                  include: {
                    inventory: {
                      include: {
                        warehouse: true
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

    if (!recipe) {
      throw new Error('Receta no encontrada')
    }

    const ingredientsStock: IngredientStock[] = []

    for (const recipeIngredient of recipe.ingredients || []) {
      const ingredient = recipeIngredient.ingredient
      let totalStock = 0
      let stockDetails: StockDetail[] = []

      if (ingredient?.productId) {
        const productStock = await this.getProductStock(ingredient.productId)
        totalStock = productStock.totalStock
        stockDetails = productStock.items
      }

      ingredientsStock.push({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        productId: ingredient.productId || null,
        requiredQuantity: recipeIngredient.quantity,
        unit: recipeIngredient.unit,
        totalStock,
        isAvailable: totalStock >= recipeIngredient.quantity,
        stockDetails
      })
    }

    return {
      recipeName: recipe.name,
      ingredients: ingredientsStock,
      allAvailable: ingredientsStock.every((i: IngredientStock) => i.isAvailable)
    }
  }

  // ============================================================
  // NUEVO: OBTENER STOCK TOTAL DE LA EMPRESA
  // ============================================================
  async getCompanyStockSummary(companyId: string): Promise<CompanyStockSummary> {
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        warehouse: {
          companyId
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        variant: {
          select: {
            id: true,
            name: true,
            value: true
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const items: CompanyStockItem[] = inventoryItems.map((item: any) => ({
      productId: item.productId,
      productName: item.product?.name || 'Producto desconocido',
      sku: item.product?.sku || '',
      variantName: item.variant ? `${item.variant.name}: ${item.variant.value}` : null,
      warehouseName: item.warehouse?.name || 'Bodega desconocida',
      currentStock: item.currentStock,
      availableStock: item.availableStock,
      lastCost: item.lastCost,
      totalValue: item.currentStock * (item.lastCost || 0)
    }))

    const totalValue = items.reduce((sum: number, item: CompanyStockItem) => sum + item.totalValue, 0)

    return {
      totalItems: items.length,
      totalValue,
      items
    }
  }
}

// ============================================================
// EXPORTAR INSTANCIA SINGLETON
// ============================================================
export const inventoryService = new InventoryService()
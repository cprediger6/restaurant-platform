// src/lib/services/order.service.ts

import 'server-only'
import { prisma } from '@/lib/db/prisma-client'
import { OrderStatus, MovementType } from '@prisma/client'

export class OrderService {
  // ============================================================
  // OBTENER PEDIDOS DE UN COMENSAL CON ALÉRGENOS
  // ============================================================
  async getOrdersByDiner(dinerId: string) {
    const orders = await prisma.order.findMany({
      where: {
        dinerId,
        status: { not: OrderStatus.BILLED }
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            },
            variant: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return Promise.all(orders.map(async (order) => {
      const itemsWithAllergens = await Promise.all(
        order.items.map(async (item) => {
          const allergens = await this.extractAllergensFromProduct(item.productId)
          return {
            ...item,
            allergens
          }
        })
      )

      return {
        ...order,
        items: itemsWithAllergens
      }
    }))
  }

  // ============================================================
  // EXTRAER ALÉRGENOS DE UN PRODUCTO
  // ============================================================
  private async extractAllergensFromProduct(productId: string) {
    const allergenSet = new Set()

    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: productId
      },
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
        },
        allergens: {
          include: {
            allergen: true
          }
        },
        crossContamination: {
          include: {
            allergen: true
          }
        }
      }
    })

    if (menuItem) {
      for (const recipeIngredient of menuItem.recipe?.ingredients || []) {
        for (const ingredientAllergen of recipeIngredient.ingredient?.allergens || []) {
          if (ingredientAllergen.allergen) {
            allergenSet.add(ingredientAllergen.allergen)
          }
        }
      }

      for (const menuItemAllergen of menuItem.allergens || []) {
        if (menuItemAllergen.allergen) {
          allergenSet.add(menuItemAllergen.allergen)
        }
      }

      for (const contamination of menuItem.crossContamination || []) {
        if (contamination.allergen) {
          allergenSet.add(contamination.allergen)
        }
      }
    }

    return Array.from(allergenSet)
  }

  // ============================================================
  // VERIFICAR ALÉRGENOS DEL COMENSAL
  // ============================================================
  async getDinerAllergies(dinerId: string) {
    return await prisma.dinerAllergy.findMany({
      where: { dinerId },
      include: { allergen: true }
    })
  }

  // ============================================================
  // AGREGAR ALÉRGENO A COMENSAL
  // ============================================================
  async addDinerAllergy(dinerId: string, allergenId: string, notes?: string) {
    return await prisma.dinerAllergy.create({
      data: {
        dinerId,
        allergenId,
        notes
      },
      include: { allergen: true }
    })
  }

  // ============================================================
  // ELIMINAR ALÉRGENO DE COMENSAL
  // ============================================================
  async removeDinerAllergy(dinerId: string, allergenId: string) {
    return await prisma.dinerAllergy.delete({
      where: {
        dinerId_allergenId: {
          dinerId,
          allergenId
        }
      }
    })
  }

  // ============================================================
  // CREAR NUEVO PEDIDO
  // ============================================================
  async createOrder(dinerId: string) {
    const diner = await prisma.diner.findUnique({
      where: { id: dinerId },
      include: { table: true }
    })

    if (!diner || !diner.active) {
      throw new Error('Comensal no encontrado o inactivo')
    }

    return await prisma.order.create({
      data: {
        dinerId,
        status: OrderStatus.PENDING,
        total: 0
      },
      include: { items: true }
    })
  }

  // ============================================================
  // AGREGAR ITEM AL PEDIDO (CON VERIFICACIÓN DE ALÉRGENOS Y DESCUENTO DE INVENTARIO)
  // ============================================================
  async addOrderItem(data: {
    orderId: string
    productId: string
    variantId?: string
    quantity: number
    notes?: string
    unitPrice: number
    userId?: string
  }) {
    const { orderId, productId, variantId, quantity, notes, unitPrice, userId } = data

    // 1. Verificar pedido
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        diner: {
          include: {
            allergies: {
              include: {
                allergen: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      throw new Error('Pedido no encontrado')
    }

    if (order.status === OrderStatus.BILLED) {
      throw new Error('Pedido ya facturado')
    }

    // 2. Verificar producto y obtener su receta - USANDO ANY PARA EVITAR ERRORES DE TIPO
    // @ts-ignore - La relación recipe existe en la base de datos pero el tipo no está actualizado
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        // @ts-ignore - recipe existe en el esquema pero el cliente no lo tiene
        recipe: {
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
        }
      }
    }) as any

    if (!product) {
      throw new Error('Producto no encontrado')
    }

    // 3. Verificar alérgenos
    const dinerAllergies = order.diner.allergies.map((a: any) => a.allergen.code)
    const productAllergens = await this.extractAllergensFromProduct(productId)
    const productAllergenCodes = productAllergens.map((a: any) => a.code)

    const conflicts = dinerAllergies.filter((a: string) => 
      productAllergenCodes.includes(a)
    )

    // 4. Descontar ingredientes del inventario
    let ingredientsConsumed: any[] = []
    let inventoryErrors: string[] = []

    if (product.recipe) {
      const result = await this.deductIngredientsFromInventory(
        product.recipe, 
        quantity, 
        userId || order.dinerId,
        `Pedido ${orderId} - ${product.name} x${quantity}`
      )
      ingredientsConsumed = result.ingredientsConsumed || []
      inventoryErrors = result.errors || []
    }

    // 5. Crear item
    const subtotal = unitPrice * quantity

    const item = await prisma.orderItem.create({
      data: {
        orderId,
        productId,
        variantId,
        quantity,
        unitPrice,
        subtotal,
        notes
      },
      include: {
        product: {
          include: {
            category: true
          }
        },
        variant: true
      }
    })

    // 6. Actualizar total
    await this.updateOrderTotal(orderId)

    // 7. Registrar auditoría
    await this.createAudit({
      orderId,
      action: 'ITEM_ADDED',
      description: `Agregado: ${product.name} x${quantity}`,
      details: {
        productId,
        quantity,
        unitPrice,
        conflicts,
        hasAllergens: conflicts.length > 0,
        ingredientsConsumed,
        inventoryErrors,
        hasInventoryErrors: inventoryErrors.length > 0
      },
      userId: order.dinerId
    })

    if (inventoryErrors.length > 0) {
      console.warn('⚠️ Errores de inventario al agregar item:', inventoryErrors)
    }

    return { 
      item, 
      conflicts, 
      ingredientsConsumed,
      inventoryErrors,
      hasInventoryErrors: inventoryErrors.length > 0
    }
  }

  // ============================================================
  // DESCONTAR INGREDIENTES DEL INVENTARIO
  // ============================================================
  private async deductIngredientsFromInventory(
    recipe: any, 
    quantity: number, 
    userId: string,
    description: string
  ): Promise<{ ingredientsConsumed: any[]; errors: string[] }> {
    const ingredientsConsumed: any[] = []
    const errors: string[] = []

    // Verificar que recipe tenga ingredients
    const recipeIngredients = recipe.ingredients || []
    
    for (const recipeIngredient of recipeIngredients) {
      if (!recipeIngredient.consumeInventory) continue

      const ingredient = recipeIngredient.ingredient
      if (!ingredient) {
        errors.push(`Ingrediente no encontrado en la receta`)
        continue
      }

      if (!ingredient.productId) {
        errors.push(`El ingrediente "${ingredient.name}" no tiene producto asociado en inventario`)
        continue
      }

      const totalQuantity = recipeIngredient.quantity * quantity

      const inventoryItems = await prisma.inventoryItem.findMany({
        where: {
          productId: ingredient.productId,
          currentStock: { gt: 0 }
        },
        include: {
          warehouse: true
        },
        orderBy: { createdAt: 'asc' }
      })

      if (inventoryItems.length === 0) {
        errors.push(`No hay stock disponible de "${ingredient.name}" (${ingredient.productId})`)
        continue
      }

      let remainingToDeduct = totalQuantity
      const deductedItems: any[] = []

      for (const inventoryItem of inventoryItems) {
        if (remainingToDeduct <= 0) break

        let quantityToDeduct = remainingToDeduct
        
        if (ingredient.conversionFactor && ingredient.conversionFactor !== 1) {
          quantityToDeduct = remainingToDeduct * ingredient.conversionFactor
        }

        const available = inventoryItem.currentStock
        const deduct = Math.min(quantityToDeduct, available)

        if (deduct > 0) {
          const movement = await prisma.inventoryMovement.create({
            data: {
              type: MovementType.OUT,
              quantity: deduct,
              unitCost: inventoryItem.lastCost || 0,
              totalCost: deduct * (inventoryItem.lastCost || 0),
              reference: `PEDIDO-${Date.now()}`,
              description: description || `Consumo por receta: ${recipe.name}`,
              inventoryItemId: inventoryItem.id,
              userId: userId
            }
          })

          await prisma.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: {
              currentStock: { decrement: deduct },
              availableStock: { decrement: deduct }
            }
          })

          await prisma.kardex.create({
            data: {
              inventoryItemId: inventoryItem.id,
              movementId: movement.id,
              quantityIn: 0,
              quantityOut: deduct,
              balance: inventoryItem.currentStock - deduct,
              unitCost: inventoryItem.lastCost || 0,
              totalCost: deduct * (inventoryItem.lastCost || 0),
              balanceCost: (inventoryItem.currentStock - deduct) * (inventoryItem.lastCost || 0)
            }
          })

          deductedItems.push({
            inventoryItemId: inventoryItem.id,
            productId: ingredient.productId,
            ingredientName: ingredient.name,
            quantity: deduct,
            unit: recipeIngredient.unit,
            warehouseId: inventoryItem.warehouseId,
            warehouseName: inventoryItem.warehouse?.name || 'N/A'
          })

          remainingToDeduct -= quantityToDeduct
        }
      }

      ingredientsConsumed.push({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        productId: ingredient.productId,
        requiredQuantity: totalQuantity,
        unit: recipeIngredient.unit,
        deductedQuantity: totalQuantity - remainingToDeduct,
        isFullyDeducted: remainingToDeduct === 0,
        remainingToDeduct: remainingToDeduct > 0 ? remainingToDeduct : 0,
        details: deductedItems
      })

      if (remainingToDeduct > 0) {
        errors.push(
          `Stock insuficiente de "${ingredient.name}". ` +
          `Necesario: ${totalQuantity} ${recipeIngredient.unit}, ` +
          `Disponible: ${totalQuantity - remainingToDeduct} ${recipeIngredient.unit}, ` +
          `Faltan: ${remainingToDeduct} ${recipeIngredient.unit}`
        )
      }
    }

    return { ingredientsConsumed, errors }
  }

  // ============================================================
  // REVERTIR DESCUENTO DE INVENTARIO (para cancelaciones)
  // ============================================================
  async revertInventoryDeduction(orderId: string) {
    const movements = await prisma.inventoryMovement.findMany({
      where: {
        description: {
          contains: `Pedido ${orderId}`
        }
      }
    })

    const results: any[] = []

    for (const movement of movements) {
      const revertMovement = await prisma.inventoryMovement.create({
        data: {
          type: MovementType.IN,
          quantity: movement.quantity,
          unitCost: movement.unitCost,
          totalCost: movement.totalCost,
          reference: `REVERTIR-${movement.reference}`,
          description: `Reversión de movimiento ${movement.id} - Pedido cancelado`,
          inventoryItemId: movement.inventoryItemId,
          userId: 'system'
        }
      })

      const inventoryItem = await prisma.inventoryItem.update({
        where: { id: movement.inventoryItemId },
        data: {
          currentStock: { increment: movement.quantity },
          availableStock: { increment: movement.quantity }
        }
      })

      await prisma.kardex.create({
        data: {
          inventoryItemId: movement.inventoryItemId,
          movementId: revertMovement.id,
          quantityIn: movement.quantity,
          quantityOut: 0,
          balance: inventoryItem.currentStock,
          unitCost: movement.unitCost,
          totalCost: movement.totalCost,
          balanceCost: inventoryItem.currentStock * movement.unitCost
        }
      })

      results.push({
        movementId: movement.id,
        reverted: true,
        quantity: movement.quantity
      })
    }

    return {
      success: true,
      movementsReverted: results.length,
      details: results
    }
  }

  // ============================================================
  // CALCULAR COSTO DE UN PRODUCTO (basado en ingredientes)
  // ============================================================
  async calculateProductCost(productId: string) {
    // @ts-ignore - recipe existe en la base de datos pero el tipo no está actualizado
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        // @ts-ignore
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: {
                  include: {
                    product: {
                      include: {
                        inventory: {
                          take: 1,
                          orderBy: { createdAt: 'desc' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        variants: true
      }
    }) as any

    if (!product || !product.recipe) {
      return { 
        totalCost: 0, 
        ingredients: [],
        margin: 0,
        message: 'El producto no tiene receta asociada'
      }
    }

    let totalCost = 0
    const ingredientCosts: any[] = []

    const recipeIngredients = product.recipe.ingredients || []

    for (const recipeIngredient of recipeIngredients) {
      const ingredient = recipeIngredient.ingredient
      
      let unitCost = 0
      let productName = 'Sin producto asociado'
      
      if (ingredient?.productId) {
        const inventoryItem = await prisma.inventoryItem.findFirst({
          where: {
            productId: ingredient.productId
          },
          orderBy: { createdAt: 'desc' }
        })
        unitCost = inventoryItem?.lastCost || 0
        
        const prod = await prisma.product.findUnique({
          where: { id: ingredient.productId }
        })
        productName = prod?.name || 'Producto desconocido'
      }

      const cost = recipeIngredient.quantity * unitCost
      totalCost += cost
      
      ingredientCosts.push({
        ingredientId: ingredient?.id || 'unknown',
        ingredientName: ingredient?.name || 'Ingrediente desconocido',
        productId: ingredient?.productId || null,
        productName: productName,
        quantity: recipeIngredient.quantity,
        unit: recipeIngredient.unit,
        unitCost: unitCost,
        cost: cost
      })
    }

    const basePrice = product.variants?.length > 0 
      ? product.variants[0].price 
      : 0

    return {
      totalCost: Number(totalCost.toFixed(2)),
      ingredients: ingredientCosts,
      basePrice: basePrice,
      margin: Number((basePrice - totalCost).toFixed(2)),
      marginPercentage: basePrice > 0 
        ? Number(((basePrice - totalCost) / basePrice * 100).toFixed(2))
        : 0
    }
  }

  // ============================================================
  // VERIFICAR DISPONIBILIDAD DE RECETA
  // ============================================================
  async checkRecipeAvailability(productId: string, quantity: number = 1) {
    // @ts-ignore
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        // @ts-ignore
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: {
                  include: {
                    product: {
                      include: {
                        inventory: {
                          where: {
                            currentStock: { gt: 0 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }) as any

    if (!product || !product.recipe) {
      return {
        productName: product?.name || 'Producto desconocido',
        hasRecipe: false,
        available: false,
        message: 'El producto no tiene receta asociada'
      }
    }

    const availability: any[] = []
    let allAvailable = true
    const recipeIngredients = product.recipe.ingredients || []

    for (const recipeIngredient of recipeIngredients) {
      const ingredient = recipeIngredient.ingredient
      
      if (!ingredient?.productId) {
        availability.push({
          ingredientName: ingredient?.name || 'Desconocido',
          required: recipeIngredient.quantity * quantity,
          unit: recipeIngredient.unit,
          available: 0,
          availableQuantity: 0,
          isAvailable: false,
          error: 'Sin producto asociado'
        })
        allAvailable = false
        continue
      }

      const totalStock = ingredient.product?.inventory?.reduce(
        (sum: number, inv: any) => sum + inv.currentStock, 
        0
      ) || 0

      const requiredQuantity = recipeIngredient.quantity * quantity
      const isAvailable = totalStock >= requiredQuantity

      availability.push({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        productId: ingredient.productId,
        required: requiredQuantity,
        unit: recipeIngredient.unit,
        availableQuantity: totalStock,
        availableUnits: totalStock / (recipeIngredient.quantity || 1),
        isAvailable: isAvailable
      })

      if (!isAvailable) allAvailable = false
    }

    return {
      productName: product.name,
      productId: product.id,
      hasRecipe: true,
      quantity,
      allAvailable,
      availability,
      message: allAvailable 
        ? 'Todos los ingredientes están disponibles' 
        : 'Algunos ingredientes no tienen suficiente stock'
    }
  }

  // ============================================================
  // ACTUALIZAR TOTAL DEL PEDIDO
  // ============================================================
  private async updateOrderTotal(orderId: string) {
    const items = await prisma.orderItem.findMany({
      where: { orderId }
    })

    const total = items.reduce((sum: number, item: any) => sum + item.subtotal, 0)

    return await prisma.order.update({
      where: { id: orderId },
      data: { total }
    })
  }

  // ============================================================
  // ACTUALIZAR NOTAS DEL ITEM
  // ============================================================
  async updateItemNotes(itemId: string, notes: string) {
    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: true }
    })

    if (!item) {
      throw new Error('Item no encontrado')
    }

    if (item.order.status === OrderStatus.BILLED) {
      throw new Error('Pedido ya facturado')
    }

    return await prisma.orderItem.update({
      where: { id: itemId },
      data: { notes }
    })
  }

  // ============================================================
  // ELIMINAR ITEM (CON REVERSIÓN DE INVENTARIO)
  // ============================================================
  async removeOrderItem(itemId: string) {
    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { 
        order: true,
        // @ts-ignore
        product: {
          include: {
            recipe: true
          }
        }
      }
    }) as any

    if (!item) {
      throw new Error('Item no encontrado')
    }

    if (item.order.status === OrderStatus.BILLED) {
      throw new Error('Pedido ya facturado')
    }

    const orderId = item.orderId

    // Revertir el descuento de inventario si el item tiene receta
    if (item.product?.recipe) {
      await this.revertInventoryDeduction(orderId)
    }

    await prisma.orderItem.delete({
      where: { id: itemId }
    })

    await this.updateOrderTotal(orderId)

    await this.createAudit({
      orderId,
      action: 'ITEM_REMOVED',
      description: `Eliminado: ${item.productId}`,
      details: { 
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.subtotal
      },
      userId: item.order.dinerId
    })

    return { success: true }
  }

  // ============================================================
  // ACTUALIZAR CANTIDAD DE UN ITEM (CON RECÁLCULO DE INVENTARIO)
  // ============================================================
  async updateItemQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0')
    }

    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { 
        order: true,
        // @ts-ignore
        product: {
          include: {
            // @ts-ignore
            recipe: {
              include: {
                ingredients: {
                  include: {
                    ingredient: true
                  }
                }
              }
            }
          }
        }
      }
    }) as any

    if (!item) {
      throw new Error('Item no encontrado')
    }

    if (item.order.status === OrderStatus.BILLED) {
      throw new Error('Pedido ya facturado')
    }

    // Si el producto tiene receta y la cantidad cambió
    if (item.product?.recipe && quantity !== item.quantity) {
      await this.revertInventoryDeduction(item.orderId)
      
      const result = await this.deductIngredientsFromInventory(
        item.product.recipe,
        quantity,
        item.order.dinerId,
        `Pedido ${item.orderId} - ${item.product.name} x${quantity} (actualizado)`
      )
      
      if (result.errors.length > 0) {
        console.warn('⚠️ Errores al actualizar inventario:', result.errors)
      }
    }

    const subtotal = item.unitPrice * quantity

    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { 
        quantity,
        subtotal
      }
    })

    await this.updateOrderTotal(item.orderId)

    await this.createAudit({
      orderId: item.orderId,
      action: 'ITEM_UPDATED',
      description: `Actualizada cantidad: ${quantity}`,
      details: { 
        productId: item.productId,
        oldQuantity: item.quantity,
        newQuantity: quantity,
        subtotal
      },
      userId: item.order.dinerId
    })

    return updatedItem
  }

  // ============================================================
  // ACTUALIZAR ESTADO DEL PEDIDO
  // ============================================================
  async updateOrderStatus(orderId: string, status: OrderStatus, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    })

    if (!order) {
      throw new Error('Pedido no encontrado')
    }

    if (order.status === OrderStatus.BILLED) {
      throw new Error('Pedido ya facturado')
    }

    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED],
      [OrderStatus.IN_PREPARATION]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [OrderStatus.BILLED],
      [OrderStatus.BILLED]: [],
      [OrderStatus.CANCELLED]: []
    }

    if (!transitions[order.status]?.includes(status)) {
      throw new Error(`No se puede cambiar de ${order.status} a ${status}`)
    }

    if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      await this.revertInventoryDeduction(orderId)
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    await this.createAudit({
      orderId,
      action: 'STATUS_CHANGED',
      description: `Estado cambiado a: ${status}`,
      details: { 
        oldStatus: order.status,
        newStatus: status
      },
      userId: userId || order.dinerId
    })

    return updatedOrder
  }

  // ============================================================
  // OBTENER DETALLE COMPLETO DE UN PEDIDO
  // ============================================================
  async getOrderDetails(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        diner: {
          include: {
            table: true,
            allergies: {
              include: {
                allergen: true
              }
            }
          }
        },
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            },
            variant: true
          }
        },
        payments: true,
        audit: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: true
          }
        }
      }
    })

    if (!order) {
      throw new Error('Pedido no encontrado')
    }

    const itemsWithAllergens = await Promise.all(
      order.items.map(async (item: any) => {
        const allergens = await this.extractAllergensFromProduct(item.productId)
        return {
          ...item,
          allergens
        }
      })
    )

    let totalCost = 0
    const itemCosts = await Promise.all(
      order.items.map(async (item: any) => {
        const costInfo = await this.calculateProductCost(item.productId)
        const itemCost = costInfo.totalCost * item.quantity
        totalCost += itemCost
        return {
          itemId: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPerUnit: costInfo.totalCost,
          itemCost: itemCost,
          margin: item.unitPrice - costInfo.totalCost
        }
      })
    )

    return {
      ...order,
      items: itemsWithAllergens,
      costAnalysis: {
        totalCost: Number(totalCost.toFixed(2)),
        totalRevenue: order.total,
        grossMargin: Number((order.total - totalCost).toFixed(2)),
        marginPercentage: order.total > 0 
          ? Number(((order.total - totalCost) / order.total * 100).toFixed(2))
          : 0,
        items: itemCosts
      }
    }
  }

  // ============================================================
  // OBTENER PEDIDOS POR ESTADO
  // ============================================================
  async getOrdersByStatus(status: OrderStatus) {
    return await prisma.order.findMany({
      where: { status },
      include: {
        diner: {
          include: {
            table: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            },
            variant: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // ============================================================
  // VERIFICAR SI UN PRODUCTO TIENE ALÉRGENOS ESPECÍFICOS
  // ============================================================
  async checkProductAllergens(productId: string, dinerId: string) {
    const dinerAllergies = await this.getDinerAllergies(dinerId)
    const productAllergens = await this.extractAllergensFromProduct(productId)

    const dinerAllergenCodes = dinerAllergies.map((a: any) => a.allergen.code)
    const productAllergenCodes = productAllergens.map((a: any) => a.code)

    const conflicts = dinerAllergenCodes.filter((a: string) => 
      productAllergenCodes.includes(a)
    )

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      dinerAllergies: dinerAllergies.map((a: any) => a.allergen),
      productAllergens
    }
  }

  // ============================================================
  // AUDITORÍA
  // ============================================================
  private async createAudit(data: {
    orderId: string
    action: string
    description?: string
    details?: any
    userId: string
  }) {
    return await prisma.orderAudit.create({
      data: {
        orderId: data.orderId,
        action: data.action,
        description: data.description,
        details: data.details,
        userId: data.userId
      }
    })
  }

  // ============================================================
  // OBTENER AUDITORÍA DE UN PEDIDO
  // ============================================================
  async getOrderAudit(orderId: string) {
    return await prisma.orderAudit.findMany({
      where: { orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // ============================================================
  // OBTENER COSTO DE UN PRODUCTO (público)
  // ============================================================
  async getProductCost(productId: string) {
    return await this.calculateProductCost(productId)
  }

  // ============================================================
  // VERIFICAR DISPONIBILIDAD DE PRODUCTO (público)
  // ============================================================
  async checkProductAvailability(productId: string, quantity: number = 1) {
    return await this.checkRecipeAvailability(productId, quantity)
  }
}

export const orderService = new OrderService()
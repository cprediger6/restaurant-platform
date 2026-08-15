// src/lib/services/order.service.ts

import 'server-only'
import { prisma } from '@/lib/db/prisma-client'
import { OrderStatus, type Order, type OrderItem } from '@prisma/client'

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

    return Promise.all(orders.map(async (order: any) => {
      const itemsWithAllergens = await Promise.all(
        order.items.map(async (item: any) => {
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

    // Buscar el MenuItem asociado al producto
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
      // Alérgenos de ingredientes de la receta
      for (const recipeIngredient of menuItem.recipe?.ingredients || []) {
        for (const ingredientAllergen of recipeIngredient.ingredient?.allergens || []) {
          if (ingredientAllergen.allergen) {
            allergenSet.add(ingredientAllergen.allergen)
          }
        }
      }

      // Alérgenos directos del menú item
      for (const menuItemAllergen of menuItem.allergens || []) {
        if (menuItemAllergen.allergen) {
          allergenSet.add(menuItemAllergen.allergen)
        }
      }

      // Contaminación cruzada
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
  // AGREGAR ITEM AL PEDIDO (CON VERIFICACIÓN DE ALÉRGENOS)
  // ============================================================
  async addOrderItem(data: {
    orderId: string
    productId: string
    variantId?: string
    quantity: number
    notes?: string
    unitPrice: number
  }) {
    const { orderId, productId, variantId, quantity, notes, unitPrice } = data

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

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      throw new Error('Producto no encontrado')
    }

    const dinerAllergies = order.diner.allergies.map((a: any) => a.allergen.code)
    const productAllergens = await this.extractAllergensFromProduct(productId)
    const productAllergenCodes = productAllergens.map((a: any) => a.code)

    const conflicts = dinerAllergies.filter((a: string) => 
      productAllergenCodes.includes(a)
    )

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

    await this.updateOrderTotal(orderId)

    await this.createAudit({
      orderId,
      action: 'ITEM_ADDED',
      description: `Agregado: ${product.name} x${quantity}`,
      details: { 
        productId, 
        quantity, 
        unitPrice, 
        conflicts,
        hasAllergens: conflicts.length > 0
      },
      userId: order.dinerId
    })

    return { item, conflicts }
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
  // ELIMINAR ITEM
  // ============================================================
  async removeOrderItem(itemId: string) {
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

    const orderId = item.orderId

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
  // ACTUALIZAR CANTIDAD DE UN ITEM
  // ============================================================
  async updateItemQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0')
    }

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
      where: { id: orderId }
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

    return {
      ...order,
      items: itemsWithAllergens
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
  // AUDITORÍA - USANDO OrderAudit
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
}

export const orderService = new OrderService()
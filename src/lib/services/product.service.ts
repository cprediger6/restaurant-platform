// src/lib/services/product.service.ts

import 'server-only'
import { prisma } from '@/lib/db/prisma-client'
import { Prisma } from '@prisma/client'

export class ProductService {
  // ============================================================
  // CRUD DE PRODUCTOS
  // ============================================================

  async getProducts(params: {
    page?: number
    limit?: number
    search?: string
    categoryId?: string
    isActive?: boolean
    companyId: string
  }) {
    const { page = 1, limit = 20, search, categoryId, isActive, companyId } = params
    const skip = (page - 1) * limit

    const where: Prisma.ProductWhereInput = {
      companyId,
      ...(isActive !== undefined && { isActive }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { internalCode: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          subcategory: true,
          variants: true,
          inventory: {
            include: {
              warehouse: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        variants: true,
        inventory: {
          include: {
            warehouse: true,
          },
        },
        ingredients: true,
        orderItems: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            order: {
              include: {
                diner: true,
              },
            },
          },
        },
      },
    })
  }

  async createProduct(data: {
    internalCode: string
    sku: string
    name: string
    description?: string
    brand?: string
    model?: string
    color?: string
    size?: string
    weight?: number
    unitOfMeasure?: string
    categoryId?: string
    subcategoryId?: string
    companyId: string
    hasIva?: boolean
    images?: string[]
    variants?: {
      name: string
      value: string
      price: number
      cost: number
      sku?: string
      barcode?: string
      stock?: number
    }[]
  }) {
    const { variants = [], ...productData } = data

    return await prisma.product.create({
      data: {
        ...productData,
        variants: {
          create: variants.map((v) => ({
            name: v.name,
            value: v.value,
            price: v.price,
            cost: v.cost,
            sku: v.sku,
            barcode: v.barcode,
            stock: v.stock || 0,
          })),
        },
      },
      include: {
        category: true,
        subcategory: true,
        variants: true,
      },
    })
  }

  async updateProduct(
    id: string,
    data: {
      internalCode?: string
      sku?: string
      name?: string
      description?: string
      brand?: string
      model?: string
      color?: string
      size?: string
      weight?: number
      unitOfMeasure?: string
      categoryId?: string
      subcategoryId?: string
      isActive?: boolean
      hasIva?: boolean
      images?: string[]
    }
  ) {
    return await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        subcategory: true,
        variants: true,
      },
    })
  }

  async deleteProduct(id: string) {
    // Verificar si tiene pedidos asociados
    const orderItems = await prisma.orderItem.count({
      where: { productId: id },
    })

    if (orderItems > 0) {
      // En lugar de eliminar, desactivar
      return await prisma.product.update({
        where: { id },
        data: { isActive: false },
      })
    }

    return await prisma.product.delete({
      where: { id },
    })
  }

  // ============================================================
  // GESTIÓN DE VARIANTES
  // ============================================================

  async getVariants(productId: string) {
    return await prisma.variant.findMany({
      where: { productId },
      orderBy: { name: 'asc' },
    })
  }

  async createVariant(data: {
    productId: string
    name: string
    value: string
    price: number
    cost: number
    sku?: string
    barcode?: string
    stock?: number
  }) {
    return await prisma.variant.create({
      data,
    })
  }

  async updateVariant(
    id: string,
    data: {
      name?: string
      value?: string
      price?: number
      cost?: number
      sku?: string
      barcode?: string
      stock?: number
    }
  ) {
    return await prisma.variant.update({
      where: { id },
      data,
    })
  }

  async deleteVariant(id: string) {
    // Verificar si tiene movimientos de inventario
    const inventoryItems = await prisma.inventoryItem.count({
      where: { variantId: id },
    })

    if (inventoryItems > 0) {
      throw new Error('No se puede eliminar una variante con inventario asociado')
    }

    return await prisma.variant.delete({
      where: { id },
    })
  }

  // ============================================================
  // GESTIÓN DE CATEGORÍAS
  // ============================================================

  async getCategories(companyId: string) {
    return await prisma.category.findMany({
      where: { companyId },
      include: {
        subcategories: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  async createCategory(data: { name: string; description?: string; companyId: string }) {
    return await prisma.category.create({
      data,
    })
  }

  async updateCategory(id: string, data: { name?: string; description?: string }) {
    return await prisma.category.update({
      where: { id },
      data,
    })
  }

  async deleteCategory(id: string) {
    // Verificar si tiene productos
    const products = await prisma.product.count({
      where: { categoryId: id },
    })

    if (products > 0) {
      throw new Error('No se puede eliminar una categoría con productos asociados')
    }

    return await prisma.category.delete({
      where: { id },
    })
  }

  // ============================================================
  // GESTIÓN DE SUBCATEGORÍAS
  // ============================================================

  async getSubcategories(categoryId: string) {
    return await prisma.subcategory.findMany({
      where: { categoryId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  async createSubcategory(data: {
    name: string
    description?: string
    categoryId: string
  }) {
    return await prisma.subcategory.create({
      data,
    })
  }

  async updateSubcategory(id: string, data: { name?: string; description?: string }) {
    return await prisma.subcategory.update({
      where: { id },
      data,
    })
  }

  async deleteSubcategory(id: string) {
    const products = await prisma.product.count({
      where: { subcategoryId: id },
    })

    if (products > 0) {
      throw new Error('No se puede eliminar una subcategoría con productos asociados')
    }

    return await prisma.subcategory.delete({
      where: { id },
    })
  }

  // ============================================================
  // RELACIONES CON INGREDIENTES (Restaurante)
  // ============================================================

  async linkIngredientToProduct(productId: string, ingredientId: string) {
    return await prisma.$executeRaw`
      INSERT INTO product_ingredients ("productId", "ingredientId")
      VALUES (${productId}, ${ingredientId})
    `
  }

  async unlinkIngredientFromProduct(productId: string, ingredientId: string) {
    return await prisma.$executeRaw`
      DELETE FROM product_ingredients
      WHERE "productId" = ${productId} AND "ingredientId" = ${ingredientId}
    `
  }

  async getProductIngredients(productId: string) {
    return await prisma.$queryRaw`
      SELECT i.* FROM ingredients i
      JOIN product_ingredients pi ON pi."ingredientId" = i.id
      WHERE pi."productId" = ${productId}
    `
  }

  // ============================================================
  // VALIDACIONES
  // ============================================================

  async checkSkuAvailability(sku: string, excludeId?: string) {
    const where: Prisma.ProductWhereInput = { sku }
    if (excludeId) {
      where.id = { not: excludeId }
    }
    const count = await prisma.product.count({ where })
    return count === 0
  }

  async checkInternalCodeAvailability(internalCode: string, excludeId?: string) {
    const where: Prisma.ProductWhereInput = { internalCode }
    if (excludeId) {
      where.id = { not: excludeId }
    }
    const count = await prisma.product.count({ where })
    return count === 0
  }
}

export const productService = new ProductService()
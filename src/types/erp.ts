// Tipos para los datos del ERP
export interface ERPProduct {
  id: string
  internalCode: string
  sku: string
  barcode?: string | null
  name: string
  description?: string | null
  brand?: string | null
  unitOfMeasure: string
  isActive: boolean
  hasIva: boolean
  categoryId?: string | null
  subcategoryId?: string | null
  companyId: string
  variants?: ERPVariant[]
  inventory?: ERPInventoryItem[]
}

export interface ERPVariant {
  id: string
  productId: string
  name: string
  value: string
  price: number
  cost: number
  sku?: string | null
  barcode?: string | null
  stock: number
}

export interface ERPInventoryItem {
  id: string
  productId: string
  variantId?: string | null
  warehouseId: string
  currentStock: number
  availableStock: number
  reservedStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
}

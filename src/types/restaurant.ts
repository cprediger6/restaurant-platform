import { ERPProduct } from './erp'

// Tipos para el módulo de restaurante

export interface Table {
  id: string
  number: string
  capacity: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'PARTIALLY_CLOSED' | 'CLOSED'
  location?: string | null
  companyId: string
  createdAt: Date
  updatedAt: Date
  diners?: Diner[]
}

export interface Diner {
  id: string
  tableId: string
  name?: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
  orders?: Order[]
}

export interface Recipe {
  id: string
  name: string
  description?: string | null
  yield: number
  unit: string
  prepTime?: number | null
  instructions?: string | null
  isActive: boolean
  companyId: string
  createdAt: Date
  updatedAt: Date
  ingredients?: RecipeIngredient[]
}

export interface RecipeIngredient {
  id: string
  recipeId: string
  productId: string
  quantity: number
  unit: string
  consumeInventory: boolean
  createdAt: Date
  updatedAt: Date
  product?: ERPProduct
}

export interface Order {
  id: string
  dinerId: string
  status: 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | 'BILLED' | 'CANCELLED'
  total: number
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  items?: OrderItem[]
  payments?: RestaurantPayment[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId?: string | null
  quantity: number
  unitPrice: number
  subtotal: number
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface RestaurantPayment {
  id: string
  orderId: string
  amount: number
  method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'TRANSFER' | 'OTHER'
  reference?: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}

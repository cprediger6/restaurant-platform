// src/components/products/ProductForm.tsx

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Loader2, Plus, X } from 'lucide-react'

// Definir tipos
interface VariantForm {
  id?: string
  name: string
  value: string
  price: number
  cost: number
  sku: string
  barcode: string
  stock: number
}

interface Category {
  id: string
  name: string
}

interface Subcategory {
  id: string
  name: string
}

interface ProductFormProps {
  product?: any
  onClose: () => void
  onSuccess: () => void
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])

  const [formData, setFormData] = useState({
    internalCode: product?.internalCode || '',
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || '',
    model: product?.model || '',
    color: product?.color || '',
    size: product?.size || '',
    weight: product?.weight || '',
    unitOfMeasure: product?.unitOfMeasure || 'Unidad',
    categoryId: product?.categoryId || '',
    subcategoryId: product?.subcategoryId || '',
    hasIva: product?.hasIva ?? true,
    images: product?.images || [],
  })

  const [variants, setVariants] = useState<VariantForm[]>(
    product?.variants?.map((v: any) => ({
      id: v.id,
      name: v.name || '',
      value: v.value || '',
      price: v.price || 0,
      cost: v.cost || 0,
      sku: v.sku || '',
      barcode: v.barcode || '',
      stock: v.stock || 0,
    })) || [{ name: '', value: '', price: 0, cost: 0, sku: '', barcode: '', stock: 0 }]
  )

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data: Category[]) => setCategories(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (formData.categoryId) {
      fetch(`/api/subcategories?categoryId=${formData.categoryId}`)
        .then((res) => res.json())
        .then((data: Subcategory[]) => setSubcategories(data))
        .catch(console.error)
    } else {
      setSubcategories([])
    }
  }, [formData.categoryId])

  const handleVariantChange = (index: number, field: keyof VariantForm, value: any) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const addVariant = (): void => {
    setVariants([...variants, { name: '', value: '', price: 0, cost: 0, sku: '', barcode: '', stock: 0 }])
  }

  const removeVariant = (index: number): void => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i: number) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = product ? `/api/products/${product.id}` : '/api/products'
      const method = product ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          variants: variants.filter((v: VariantForm) => v.name && v.value),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar producto')
      }

      alert(product ? '✅ Producto actualizado' : '✅ Producto creado')
      onSuccess()
    } catch (error: any) {
      setError(error.message)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        </DialogHeader>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="internalCode">Código Interno</Label>
              <Input
                id="internalCode"
                value={formData.internalCode}
                onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="size">Talla</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="weight">Peso</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unitOfMeasure">Unidad de Medida</Label>
              <Input
                id="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasIva}
                  onChange={(e) => setFormData({ ...formData, hasIva: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm">Tiene IVA</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryId">Categoría</Label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">Sin categoría</option>
                {categories.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="subcategoryId">Subcategoría</Label>
              <select
                id="subcategoryId"
                value={formData.subcategoryId}
                onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                disabled={!formData.categoryId}
              >
                <option value="">Sin subcategoría</option>
                {subcategories.map((sub: Subcategory) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Label className="font-medium">Variantes</Label>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-1" /> Agregar
              </Button>
            </div>

            {variants.map((variant: VariantForm, index: number) => (
              <div key={index} className="grid grid-cols-7 gap-2 items-end bg-gray-50 p-3 rounded-lg">
                <div className="col-span-2">
                  <Label className="text-xs">Nombre</Label>
                  <Input
                    value={variant.name}
                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                    placeholder="Ej: Talla"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs">Valor</Label>
                  <Input
                    value={variant.value}
                    onChange={(e) => handleVariantChange(index, 'value', e.target.value)}
                    placeholder="Ej: M"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Precio</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Costo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={variant.cost}
                    onChange={(e) => handleVariantChange(index, 'cost', parseFloat(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Stock</Label>
                  <Input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 mt-4"
                    onClick={() => removeVariant(index)}
                    disabled={variants.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
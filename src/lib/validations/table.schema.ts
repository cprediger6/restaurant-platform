// src/lib/validations/table.schema.ts

import { z } from 'zod'

export const createTableSchema = z.object({
  number: z.string().min(1, 'El número de mesa es requerido'),
  capacity: z.number().min(1, 'La capacidad mínima es 1').max(20, 'La capacidad máxima es 20'),
  location: z.string().optional()
})

export const updateTableStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'PARTIALLY_CLOSED', 'CLOSED'])
})

export const addDinerSchema = z.object({
  name: z.string().optional()
})

export const tableIdSchema = z.object({
  id: z.string().cuid()
})

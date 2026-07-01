'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const ProductSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(150),
  sku: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  description: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  quantity: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  minStock: z.coerce.number().int().min(0, 'El stock mínimo no puede ser negativo'),
  location: z.string().optional(),
  status: z.enum(['ACTIVO', 'DESCONTINUADO']),
  categoryId: z.string().min(1, 'Seleccione una categoría'),
})

async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('No autenticado')
  return session
}

function parseProductForm(formData: FormData) {
  return ProductSchema.parse({
    name: formData.get('name'),
    sku: formData.get('sku'),
    description: formData.get('description') || undefined,
    brand: formData.get('brand') || undefined,
    model: formData.get('model') || undefined,
    price: formData.get('price'),
    quantity: formData.get('quantity'),
    minStock: formData.get('minStock'),
    location: formData.get('location') || undefined,
    status: formData.get('status') ?? 'ACTIVO',
    categoryId: formData.get('categoryId'),
  })
}

export async function createProduct(formData: FormData) {
  const session = await requireSession()
  const parsed = parseProductForm(formData)

  const existing = await prisma.product.findUnique({ where: { sku: parsed.sku } })
  if (existing) throw new Error('Ya existe un producto con ese SKU')

  const product = await prisma.product.create({ data: parsed })

  if (product.quantity > 0) {
    await prisma.stockMovement.create({
      data: {
        type: 'ENTRADA',
        quantity: product.quantity,
        note: 'Stock inicial',
        productId: product.id,
        userId: session.user.id,
      },
    })
  }

  revalidatePath('/productos')
  redirect(`/productos/${product.id}`)
}

export async function updateProduct(id: string, formData: FormData) {
  await requireSession()
  const parsed = parseProductForm(formData)

  const existing = await prisma.product.findUnique({ where: { sku: parsed.sku } })
  if (existing && existing.id !== id) throw new Error('Ya existe un producto con ese SKU')

  const { quantity: _quantity, ...data } = parsed

  await prisma.product.update({ where: { id }, data })

  revalidatePath('/productos')
  revalidatePath(`/productos/${id}`)
  redirect(`/productos/${id}`)
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') throw new Error('Sin permisos')

  await prisma.product.delete({ where: { id } })

  revalidatePath('/productos')
  redirect('/productos')
}

const StockAdjustSchema = z.object({
  type: z.enum(['ENTRADA', 'SALIDA', 'AJUSTE']),
  quantity: z.coerce.number().int().min(1, 'La cantidad debe ser mayor a 0'),
  note: z.string().optional(),
})

export async function adjustStock(productId: string, formData: FormData) {
  const session = await requireSession()
  const parsed = StockAdjustSchema.parse({
    type: formData.get('type'),
    quantity: formData.get('quantity'),
    note: formData.get('note') || undefined,
  })

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new Error('Producto no encontrado')

  const delta = parsed.type === 'SALIDA' ? -parsed.quantity : parsed.quantity
  const newQuantity = product.quantity + delta
  if (newQuantity < 0) throw new Error('Stock insuficiente para esta salida')

  await prisma.$transaction([
    prisma.product.update({ where: { id: productId }, data: { quantity: newQuantity } }),
    prisma.stockMovement.create({
      data: {
        type: parsed.type,
        quantity: parsed.quantity,
        note: parsed.note,
        productId,
        userId: session.user.id,
      },
    }),
  ])

  revalidatePath(`/productos/${productId}`)
  revalidatePath('/productos')
}

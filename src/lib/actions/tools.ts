'use server'

import { prisma } from '@/lib/prisma'
import { validateRequired } from '@/utils/validation'

async function generateInventoryNumber(category: string): Promise<string> {
  const prefix = category.substring(0, 4).toUpperCase()
  const lastTool = await prisma.tool.findFirst({
    where: { inventoryNumber: { startsWith: prefix } },
    orderBy: { inventoryNumber: 'desc' },
  })
  const nextNum = lastTool ? parseInt(lastTool.inventoryNumber.split('-')[1]) + 1 : 1
  return `${prefix}-${String(nextNum).padStart(3, '0')}`
}

export async function addTool(formData: FormData) {
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const imageData = formData.get('imageData') as string
  const availableQtyStr = formData.get('availableQty') as string
  const totalQtyStr = formData.get('totalQty') as string

  const nameError = validateRequired(name, 'Tool name')
  if (nameError) return { success: false, error: nameError }

  const catError = validateRequired(category, 'Category')
  if (catError) return { success: false, error: catError }

  const availableQty = parseInt(availableQtyStr)
  const totalQty = parseInt(totalQtyStr)

  if (isNaN(availableQty) || availableQty < 0) return { success: false, error: 'Available quantity must be a valid non-negative number' }
  if (isNaN(totalQty) || totalQty < 0) return { success: false, error: 'Total quantity must be a valid non-negative number' }

  const inventoryNumber = await generateInventoryNumber(category)

  await prisma.tool.create({
    data: {
      name,
      category,
      imageData: imageData || null,
      inventoryNumber,
      availableQty,
      totalQty,
    },
  })

  return { success: true, error: null, inventoryNumber }
}

export async function getAllTools() {
  return prisma.tool.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAvailableTools() {
  return prisma.tool.findMany({
    where: { availableQty: { gt: 0 } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getToolById(id: string) {
  return prisma.tool.findUnique({
    where: { id },
  })
}

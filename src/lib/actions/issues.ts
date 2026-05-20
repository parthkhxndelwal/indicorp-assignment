'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function issueTool(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Not authenticated' }
  }

  const toolId = formData.get('toolId') as string
  const quantityStr = formData.get('quantity') as string
  const purpose = formData.get('purpose') as string
  const conditionNotes = formData.get('conditionNotes') as string

  if (!toolId) return { success: false, error: 'Tool ID is required' }

  const quantity = parseInt(quantityStr)
  if (isNaN(quantity) || quantity < 1) return { success: false, error: 'Quantity must be at least 1' }

  const tool = await prisma.tool.findUnique({ where: { id: toolId } })
  if (!tool) return { success: false, error: 'Tool not found' }
  if (tool.availableQty < quantity) return { success: false, error: `Not enough stock. Only ${tool.availableQty} available.` }

  await prisma.$transaction([
    prisma.issue.create({
      data: {
        toolId,
        mechanicId: session.user.id,
        quantity,
        purpose: purpose || null,
        conditionNotes: conditionNotes || null,
        status: 'ISSUED',
        issuedAt: new Date(),
      },
    }),
    prisma.tool.update({
      where: { id: toolId },
      data: { availableQty: { decrement: quantity } },
    }),
  ])

  return { success: true, error: null }
}

export async function returnTool(issueId: string) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Not authenticated' }
  }

  const issue = await prisma.issue.findUnique({ where: { id: issueId } })
  if (!issue) return { success: false, error: 'Issue record not found' }
  if (issue.status === 'RETURNED') return { success: false, error: 'This tool has already been returned' }
  if (issue.mechanicId !== session.user.id) return { success: false, error: 'You can only return your own issued tools' }

  await prisma.$transaction([
    prisma.issue.update({
      where: { id: issueId },
      data: { status: 'RETURNED', returnedAt: new Date() },
    }),
    prisma.tool.update({
      where: { id: issue.toolId },
      data: { availableQty: { increment: issue.quantity } },
    }),
  ])

  return { success: true, error: null }
}

export async function getAllIssues() {
  return prisma.issue.findMany({
    include: {
      tool: true,
      mechanic: true,
    },
    orderBy: { issuedAt: 'desc' },
  })
}

export async function getMechanicIssues(mechanicId: string) {
  return prisma.issue.findMany({
    where: { mechanicId },
    include: {
      tool: true,
    },
    orderBy: { issuedAt: 'desc' },
  })
}

export async function getMechanicActiveIssues(mechanicId: string) {
  return prisma.issue.findMany({
    where: { mechanicId, status: 'ISSUED' },
    include: {
      tool: true,
    },
    orderBy: { issuedAt: 'desc' },
  })
}

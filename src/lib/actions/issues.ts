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

export async function updateIssue(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Only admins can edit issues' }
  }

  const issueId = formData.get('issueId') as string
  const quantityStr = formData.get('quantity') as string
  const purpose = formData.get('purpose') as string
  const conditionNotes = formData.get('conditionNotes') as string

  if (!issueId) return { success: false, error: 'Issue ID is required' }

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { tool: true },
  })
  if (!issue) return { success: false, error: 'Issue not found' }

  const quantity = parseInt(quantityStr)
  if (isNaN(quantity) || quantity < 1) return { success: false, error: 'Quantity must be at least 1' }

  const qtyDiff = quantity - issue.quantity

  if (issue.status === 'ISSUED') {
    const newAvailable = issue.tool.availableQty - qtyDiff
    if (newAvailable < 0) return { success: false, error: `Not enough stock. Only ${issue.tool.availableQty + issue.quantity} total available.` }

    await prisma.$transaction([
      prisma.issue.update({
        where: { id: issueId },
        data: {
          quantity,
          purpose: purpose || null,
          conditionNotes: conditionNotes || null,
        },
      }),
      prisma.tool.update({
        where: { id: issue.toolId },
        data: { availableQty: newAvailable },
      }),
    ])
  } else {
    await prisma.issue.update({
      where: { id: issueId },
      data: {
        quantity,
        purpose: purpose || null,
        conditionNotes: conditionNotes || null,
      },
    })
  }

  return { success: true, error: null }
}

export async function deleteIssue(issueId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Only admins can delete issues' }
  }

  if (!issueId) return { success: false, error: 'Issue ID is required' }

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { tool: true },
  })
  if (!issue) return { success: false, error: 'Issue not found' }

  if (issue.status === 'ISSUED') {
    await prisma.$transaction([
      prisma.issue.delete({ where: { id: issueId } }),
      prisma.tool.update({
        where: { id: issue.toolId },
        data: { availableQty: { increment: issue.quantity } },
      }),
    ])
  } else {
    await prisma.issue.delete({ where: { id: issueId } })
  }

  return { success: true, error: null }
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

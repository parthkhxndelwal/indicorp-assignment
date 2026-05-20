const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#e9ecef" width="200" height="200"/><g transform="translate(100,100) scale(3.2)" fill="#6c757d"><path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z"/></g></svg>`
  ).toString('base64')

async function main() {
  console.log('Seeding database...')

  const hashedAdminPassword = await bcrypt.hash('Admin@123', 10)
  const hashedMechanicPassword = await bcrypt.hash('Mech@123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedAdminPassword,
      role: 'ADMIN',
    },
  })
  console.log(`Admin user created: ${admin.email}`)

  const mechanic = await prisma.user.upsert({
    where: { email: 'mechanic@example.com' },
    update: {},
    create: {
      email: 'mechanic@example.com',
      name: 'John Mechanic',
      password: hashedMechanicPassword,
      role: 'MECHANIC',
    },
  })
  console.log(`Mechanic user created: ${mechanic.email}`)

  await prisma.mechanicProfile.upsert({
    where: { userId: mechanic.id },
    update: {},
    create: {
      userId: mechanic.id,
      mobile: '9876543210',
      level: 'EXPERT',
      picture: PLACEHOLDER_IMAGE,
    },
  })
  console.log('Mechanic profile created')

  const tools = [
    { name: 'Phillips Screwdriver', category: 'Screwdriver', inventoryNumber: 'SCRE-001', availableQty: 10, totalQty: 10 },
    { name: 'Flathead Screwdriver', category: 'Screwdriver', inventoryNumber: 'SCRE-002', availableQty: 8, totalQty: 10 },
    { name: 'Adjustable Wrench', category: 'Wrench', inventoryNumber: 'WREN-001', availableQty: 5, totalQty: 5 },
    { name: 'Pipe Wrench', category: 'Wrench', inventoryNumber: 'WREN-002', availableQty: 3, totalQty: 3 },
    { name: 'Needle Nose Plier', category: 'Plier', inventoryNumber: 'PLIE-001', availableQty: 7, totalQty: 7 },
    { name: 'Claw Hammer', category: 'Hammer', inventoryNumber: 'HAMM-001', availableQty: 4, totalQty: 4 },
    { name: 'Socket Set 24pc', category: 'Socket Set', inventoryNumber: 'SOCK-001', availableQty: 2, totalQty: 2 },
    { name: 'Measuring Tape 5m', category: 'Measuring Tape', inventoryNumber: 'MEAS-001', availableQty: 6, totalQty: 6 },
  ]

  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { inventoryNumber: tool.inventoryNumber },
      update: {},
      create: {
        ...tool,
        imageData: PLACEHOLDER_IMAGE,
      },
    })
  }
  console.log(`${tools.length} tools created`)

  const firstTool = await prisma.tool.findUnique({ where: { inventoryNumber: 'SCRE-001' } })
  if (firstTool) {
    await prisma.issue.create({
      data: {
        toolId: firstTool.id,
        mechanicId: mechanic.id,
        quantity: 2,
        purpose: 'Sample issue for testing',
        conditionNotes: 'All good',
        status: 'ISSUED',
        issuedAt: new Date(),
      },
    })
    await prisma.tool.update({
      where: { id: firstTool.id },
      data: { availableQty: { decrement: 2 } },
    })
    console.log('Sample issue created')
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

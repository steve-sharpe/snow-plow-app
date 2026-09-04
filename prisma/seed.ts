import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Create Driver (Default PIN is 1234)
  const driver = await prisma.driver.create({
    data: {
      name: 'Test Driver',
      pin: '1234', 
    },
  })

  // 2. Create Client
  const client = await prisma.client.create({
    data: {
      name: 'Test Client',
      address: '123 Snowy Lane',
      email: 'client@example.com',
    },
  })

  // 3. Create Job for today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.job.create({
    data: {
      date: today,
      clientId: client.id,
      driverId: driver.id,
      stage: 'scheduled',
    },
  })

  // 4. Create Email Templates
  await prisma.emailTemplate.createMany({
    data: [
      { stage: 'enroute', subject: 'En route to {{address}}', body: 'Hi {{clientName}}, we are on our way to {{address}}.' },
      { stage: 'plowing', subject: 'Plowing at {{address}}', body: 'Hi {{clientName}}, we are currently plowing {{address}}.' },
      { stage: 'completed', subject: 'Completed at {{address}}', body: 'Hi {{clientName}}, plowing at {{address}} is complete.' },
      { stage: 'issue', subject: 'Issue at {{address}}', body: 'Hi {{clientName}}, we encountered an issue at {{address}}.' },
    ],
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
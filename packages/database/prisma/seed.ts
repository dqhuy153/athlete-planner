import { PrismaClient } from '../src/generated/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create root admin
  const email = process.env.ROOT_ADMIN_EMAIL
  const password = process.env.ROOT_ADMIN_PASSWORD
  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.upsert({
    where: { email },
    update: { role: 'root', passwordHash, isVerified: true },
    create: {
      email,
      name: 'Root Admin',
      passwordHash,
      authProvider: 'local',
      role: 'root',
      isVerified: true,
    },
  })

  console.log('Root admin seeded:', email)

  // Create default app configs
  const defaultConfigs = [
    { key: 'app.name', value: 'My App', label: 'Application name' },
    { key: 'user.defaultBalance', value: 0, label: 'Default user balance' },
  ]

  for (const config of defaultConfigs) {
    await prisma.appConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }

  console.log('Default configs seeded.')
  console.log('Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

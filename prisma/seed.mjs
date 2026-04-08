import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sites = [
  { siteKey: 'rapidmvp', primaryDomain: 'rapidmvp.io' },
  { siteKey: 'ooocreatives', primaryDomain: 'ooocreatives.com' },
  { siteKey: 'movieshaker', primaryDomain: 'movieshaker.com' },
  { siteKey: 'afilminabox', primaryDomain: 'afilminabox.com' },
  { siteKey: 'reelinvesting', primaryDomain: 'reelinvesting.com' },
]

async function main() {
  for (const site of sites) {
    await prisma.site.upsert({
      where: { siteKey: site.siteKey },
      create: site,
      update: {
        primaryDomain: site.primaryDomain,
        isActive: true,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    globalThis.process?.exit?.(1)
  })

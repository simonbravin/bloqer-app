import { prisma, Prisma } from '@repo/database'

export async function calculateStockBalance(
  itemId: string,
  locationId: string,
  orgId: string
): Promise<Prisma.Decimal> {
  const movements = await prisma.inventoryMovement.findMany({
    where: {
      itemId,
      orgId,
      OR: [
        { toLocationId: locationId },
        { fromLocationId: locationId },
      ],
    },
    select: {
      fromLocationId: true,
      toLocationId: true,
      quantity: true,
    },
  })

  let balance = new Prisma.Decimal(0)

  for (const m of movements) {
    if (m.toLocationId === locationId) {
      balance = balance.add(m.quantity)
    }
    if (m.fromLocationId === locationId) {
      balance = balance.sub(m.quantity)
    }
  }

  return balance
}

export async function calculateTotalStock(itemId: string, orgId: string): Promise<Prisma.Decimal> {
  const item = await prisma.inventoryItem.findFirst({
    where: { id: itemId, orgId },
    select: { id: true },
  })
  if (!item) return new Prisma.Decimal(0)

  const locations = await prisma.inventoryLocation.findMany({
    where: { orgId, active: true },
    select: { id: true },
  })

  let total = new Prisma.Decimal(0)
  for (const loc of locations) {
    const bal = await calculateStockBalance(itemId, loc.id, orgId)
    total = total.add(bal)
  }
  return total
}

export async function getStockByLocation(itemId: string, orgId: string) {
  const locations = await prisma.inventoryLocation.findMany({
    where: { orgId, active: true },
    select: { id: true, name: true, type: true },
  })

  const levels = await Promise.all(
    locations.map(async (loc) => ({
      location: loc,
      balance: await calculateStockBalance(itemId, loc.id, orgId),
    }))
  )

  return levels.filter((l) => l.balance.gt(0))
}


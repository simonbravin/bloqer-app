import { prisma } from './client'

async function seedCurrencies() {
  await prisma.currency.createMany({
    data: [
      { code: 'ARS', name: 'Peso Argentino', symbol: '$', decimalPlaces: 2, active: true },
      { code: 'USD', name: 'Dólar Estadounidense', symbol: 'US$', decimalPlaces: 2, active: true },
      { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2, active: true },
      { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', decimalPlaces: 2, active: true },
      { code: 'CLP', name: 'Peso Chileno', symbol: '$', decimalPlaces: 2, active: true },
      { code: 'COP', name: 'Peso Colombiano', symbol: '$', decimalPlaces: 2, active: true },
      { code: 'MXN', name: 'Peso Mexicano', symbol: '$', decimalPlaces: 2, active: true },
    ],
    skipDuplicates: true,
  })
}

async function main() {
  await seedCurrencies()
  console.log('Seed completed: currencies')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

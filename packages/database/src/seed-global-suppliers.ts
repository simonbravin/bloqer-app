import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SUPPLIERS = [
  {
    name: 'CEMEX',
    legalName: 'CEMEX S.A.B. de C.V.',
    category: 'CONCRETE_SUPPLIER',
    subcategories: ['READY_MIX', 'CEMENT', 'AGGREGATES'],
    countries: ['MX', 'US', 'CO', 'PE', 'AR'],
    regions: ['North America', 'Latin America'],
    description:
      'Global building materials company providing cement, ready-mix concrete, aggregates, and related services.',
    verified: true,
    certifications: ['ISO9001', 'ISO14001'],
  },
  {
    name: 'Hilti',
    legalName: 'Hilti Corporation',
    category: 'TOOL_MANUFACTURER',
    subcategories: ['POWER_TOOLS', 'FASTENING', 'DRILLING'],
    countries: ['MX', 'AR', 'BR', 'CL', 'CO'],
    regions: ['Latin America'],
    description:
      'Professional-grade tools and equipment for construction industry.',
    verified: true,
    certifications: ['ISO9001'],
  },
  {
    name: 'Caterpillar',
    legalName: 'Caterpillar Inc.',
    category: 'EQUIPMENT_SUPPLIER',
    subcategories: ['HEAVY_EQUIPMENT', 'ENGINES'],
    countries: ['US', 'MX', 'BR', 'AR', 'CL'],
    regions: ['Americas'],
    description: 'Heavy equipment and engines for construction and mining.',
    verified: true,
    certifications: ['ISO9001'],
  },
  {
    name: 'Sika',
    legalName: 'Sika AG',
    category: 'CHEMICAL_SUPPLIER',
    subcategories: ['ADHESIVES', 'SEALANTS', 'WATERPROOFING'],
    countries: ['MX', 'AR', 'BR', 'CO', 'PE'],
    regions: ['Latin America'],
    description: 'Construction chemicals and systems.',
    verified: true,
    certifications: ['ISO9001', 'ISO14001'],
  },
  {
    name: 'Saint-Gobain',
    legalName: 'Compagnie de Saint-Gobain S.A.',
    category: 'BUILDING_MATERIALS',
    subcategories: ['GYPSUM', 'INSULATION', 'GLASS'],
    countries: ['MX', 'BR', 'AR'],
    regions: ['Latin America'],
    description: 'Building materials and construction products.',
    verified: true,
    certifications: ['ISO9001'],
  },
]

export async function seedGlobalSuppliers() {
  for (const s of SUPPLIERS) {
    const existing = await prisma.globalParty.findFirst({
      where: { name: s.name },
    })
    if (existing) {
      await prisma.globalParty.update({
        where: { id: existing.id },
        data: { ...s, certifications: s.certifications },
      })
    } else {
      await prisma.globalParty.create({
        data: { ...s, certifications: s.certifications },
      })
    }
  }
  console.log('✅ Global suppliers seeded')
}

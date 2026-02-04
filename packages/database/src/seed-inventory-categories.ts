/**
 * Seed inventory categories and subcategories.
 * Run after migration that adds inventory_categories and inventory_subcategories.
 * Backfills inventory_items.category_id with "Otro / Sin clasificar" for existing rows.
 */
import { prisma } from './client'

const CATEGORIES_WITH_SUBCATEGORIES: { name: string; subcategories: string[] }[] = [
  {
    name: 'Materiales de Obra Gris (Estructurales)',
    subcategories: ['Agregados', 'Conglomerantes', 'Aceros', 'Ladrillería'],
  },
  {
    name: 'Acabados y Revestimientos',
    subcategories: ['Pisos y Paredes', 'Pinturas y Químicos', 'Cielos y Paneles'],
  },
  {
    name: 'Instalaciones Hidrosanitarias y Gas',
    subcategories: ['Tuberías', 'Accesorios', 'Aparatos'],
  },
  {
    name: 'Instalaciones Eléctricas e Iluminación',
    subcategories: ['Conducción', 'Cableado', 'Dispositivos', 'Luminarias'],
  },
  {
    name: 'Herramientas y Equipo Menor',
    subcategories: ['Herramienta Manual', 'Herramienta Eléctrica', 'Consumibles'],
  },
  {
    name: 'Equipo de Protección Personal (EPP)',
    subcategories: ['Protección Corporal', 'Protección Facial/Auditiva', 'Alturas'],
  },
  {
    name: 'Maquinaria y Equipo Mayor (Activos)',
    subcategories: ['Equipo Propio', 'Maquinaria Amarilla'],
  },
  {
    name: 'Otro / Sin clasificar',
    subcategories: ['General'],
  },
]

export async function seedInventoryCategories() {
  const existing = await prisma.inventoryCategory.count()
  if (existing > 0) {
    console.log('Seed: inventory categories already exist, skipping')
    return
  }

  let sortOrder = 0
  for (const cat of CATEGORIES_WITH_SUBCATEGORIES) {
    const created = await prisma.inventoryCategory.create({
      data: {
        name: cat.name,
        sortOrder: sortOrder++,
        subcategories: {
          create: cat.subcategories.map((name, i) => ({
            name,
            sortOrder: i,
          })),
        },
      },
    })
    console.log(`Seed: category "${created.name}" with ${cat.subcategories.length} subcategories`)
  }

  // Backfill existing inventory_items: set categoryId to "Otro / Sin clasificar"
  const otro = await prisma.inventoryCategory.findFirst({
    where: { name: 'Otro / Sin clasificar' },
    select: { id: true },
  })
  if (otro) {
    const result = await prisma.inventoryItem.updateMany({
      where: { categoryId: null },
      data: { categoryId: otro.id },
    })
    if (result.count > 0) {
      console.log(`Seed: backfilled category_id for ${result.count} inventory items`)
    }
  }
}

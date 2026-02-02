import { prisma } from './client'
import { Decimal } from '@prisma/client/runtime/library'

async function seedTemplates() {
  console.log('Seeding project templates...')

  // Clean existing WBS templates for our templates (idempotent re-run)
  await prisma.wbsTemplate.deleteMany({
    where: {
      projectTemplateId: {
        in: [
          'template-obra-publica',
          'template-obra-privada',
          'template-ampliacion-cocina',
          'template-ampliacion-bano',
        ],
      },
    },
  })

  // 1. Construction Systems
  const steelFrame = await prisma.constructionSystem.upsert({
    where: { id: 'system-steel-frame' },
    create: {
      id: 'system-steel-frame',
      name: 'Steel Frame',
      description: 'Sistema de construcción en seco con perfiles de acero galvanizado',
      category: 'STRUCTURE',
      sortOrder: 2,
    },
    update: {},
  })

  const vbt = await prisma.constructionSystem.upsert({
    where: { id: 'system-vbt' },
    create: {
      id: 'system-vbt',
      name: 'Vision Building Technologies (VBT)',
      description: 'Sistema modular prefabricado',
      category: 'STRUCTURE',
      sortOrder: 1,
    },
    update: {},
  })

  const sip = await prisma.constructionSystem.upsert({
    where: { id: 'system-sip' },
    create: {
      id: 'system-sip',
      name: 'Paneles SIP',
      description: 'Structural Insulated Panels',
      category: 'STRUCTURE',
      sortOrder: 3,
    },
    update: {},
  })

  const traditional = await prisma.constructionSystem.upsert({
    where: { id: 'system-traditional' },
    create: {
      id: 'system-traditional',
      name: 'Mampostería Tradicional',
      description: 'Construcción tradicional con ladrillos y hormigón',
      category: 'STRUCTURE',
      sortOrder: 4,
    },
    update: {},
  })

  const otro = await prisma.constructionSystem.upsert({
    where: { id: 'system-otro' },
    create: {
      id: 'system-otro',
      name: 'Otro',
      description: 'Otro sistema constructivo o sin especificar',
      category: 'STRUCTURE',
      sortOrder: 5,
    },
    update: {},
  })

  // 2. Project Templates - OBRA PÚBLICA (sortOrder 1)
  const obraPublica = await prisma.projectTemplate.upsert({
    where: { id: 'template-obra-publica' },
    create: {
      id: 'template-obra-publica',
      name: 'Obra Pública',
      description: 'Template para proyectos de obra pública con todos los requisitos estándar',
      category: 'PUBLIC',
      sortOrder: 1,
    },
    update: {},
  })

  // WBS para Obra Pública - create with proper hierarchy
  const phase1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      code: '1',
      name: 'TRABAJOS PRELIMINARES',
      category: 'PHASE',
      sortOrder: 1,
    },
  })

  const task1_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: phase1.id,
      code: '1.1',
      name: 'Limpieza de Terreno',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: task1_1.id,
      code: '1.1.1',
      name: 'Desmalezado y limpieza general',
      category: 'ITEM',
      unit: 'm2',
      defaultQuantity: new Decimal(0),
      sortOrder: 1,
    },
  })

  const task1_2 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: phase1.id,
      code: '1.2',
      name: 'Demoliciones',
      category: 'TASK',
      sortOrder: 2,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: task1_2.id,
      code: '1.2.1',
      name: 'Demolición de estructuras existentes',
      category: 'ITEM',
      unit: 'm3',
      defaultQuantity: new Decimal(0),
      sortOrder: 1,
    },
  })

  // FASE 2: MOVIMIENTO DE SUELOS
  const phase2 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      code: '2',
      name: 'MOVIMIENTO DE SUELOS',
      category: 'PHASE',
      sortOrder: 2,
    },
  })

  const task2_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: phase2.id,
      code: '2.1',
      name: 'Excavaciones',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: task2_1.id,
      code: '2.1.1',
      name: 'Excavación para fundaciones',
      category: 'ITEM',
      unit: 'm3',
      defaultQuantity: new Decimal(0),
      sortOrder: 1,
    },
  })

  const task2_2 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: phase2.id,
      code: '2.2',
      name: 'Rellenos',
      category: 'TASK',
      sortOrder: 2,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: task2_2.id,
      code: '2.2.1',
      name: 'Relleno compactado',
      category: 'ITEM',
      unit: 'm3',
      defaultQuantity: new Decimal(0),
      sortOrder: 1,
    },
  })

  // FASE 3: ESTRUCTURA
  const phase3 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      code: '3',
      name: 'ESTRUCTURA',
      category: 'PHASE',
      sortOrder: 3,
    },
  })

  const task3_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: phase3.id,
      code: '3.1',
      name: 'Fundaciones',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: task3_1.id,
      code: '3.1.1',
      name: 'Bases de hormigón armado',
      category: 'ITEM',
      unit: 'm3',
      defaultQuantity: new Decimal(0),
      sortOrder: 1,
    },
  })

  const task3_2 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: phase3.id,
      code: '3.2',
      name: 'Muros - Steel Frame',
      category: 'TASK',
      constructionSystemId: steelFrame.id,
      sortOrder: 2,
    },
  })

  await prisma.wbsTemplate.createMany({
    data: [
      {
        projectTemplateId: obraPublica.id,
        parentId: task3_2.id,
        code: '3.2.1',
        name: 'Montantes y rieles Steel Frame',
        category: 'ITEM',
        unit: 'm2',
        defaultQuantity: new Decimal(0),
        constructionSystemId: steelFrame.id,
        sortOrder: 1,
      },
      {
        projectTemplateId: obraPublica.id,
        parentId: task3_2.id,
        code: '3.2.2',
        name: 'Placas de yeso (drywall)',
        category: 'ITEM',
        unit: 'm2',
        defaultQuantity: new Decimal(0),
        constructionSystemId: steelFrame.id,
        sortOrder: 2,
      },
    ],
  })

  const task3_3 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: phase3.id,
      code: '3.3',
      name: 'Muros - Mampostería',
      category: 'TASK',
      constructionSystemId: traditional.id,
      sortOrder: 3,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: task3_3.id,
      code: '3.3.1',
      name: 'Muro de ladrillo hueco 18cm',
      category: 'ITEM',
      unit: 'm2',
      defaultQuantity: new Decimal(0),
      constructionSystemId: traditional.id,
      sortOrder: 1,
    },
  })

  // FASE 4: INSTALACIONES
  const phase4 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      code: '4',
      name: 'INSTALACIONES',
      category: 'PHASE',
      sortOrder: 4,
    },
  })

  const task4_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: phase4.id,
      code: '4.1',
      name: 'Instalación Eléctrica',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.createMany({
    data: [
      {
        projectTemplateId: obraPublica.id,
        parentId: task4_1.id,
        code: '4.1.1',
        name: 'Tablero principal',
        category: 'ITEM',
        unit: 'un',
        defaultQuantity: new Decimal(1),
        sortOrder: 1,
      },
      {
        projectTemplateId: obraPublica.id,
        parentId: task4_1.id,
        code: '4.1.2',
        name: 'Cableado eléctrico',
        category: 'ITEM',
        unit: 'm',
        defaultQuantity: new Decimal(0),
        sortOrder: 2,
      },
    ],
  })

  const task4_2 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: phase4.id,
      code: '4.2',
      name: 'Instalación Sanitaria',
      category: 'TASK',
      sortOrder: 2,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: task4_2.id,
      code: '4.2.1',
      name: 'Cañerías PVC',
      category: 'ITEM',
      unit: 'm',
      defaultQuantity: new Decimal(0),
      sortOrder: 1,
    },
  })

  // FASE 5: TERMINACIONES
  const phase5 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      code: '5',
      name: 'TERMINACIONES',
      category: 'PHASE',
      sortOrder: 5,
    },
  })

  const task5_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: phase5.id,
      code: '5.1',
      name: 'Revoques',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: task5_1.id,
      code: '5.1.1',
      name: 'Revoque grueso',
      category: 'ITEM',
      unit: 'm2',
      defaultQuantity: new Decimal(0),
      sortOrder: 1,
    },
  })

  const task5_2 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: phase5.id,
      code: '5.2',
      name: 'Pisos',
      category: 'TASK',
      sortOrder: 2,
    },
  })

  await prisma.wbsTemplate.createMany({
    data: [
      {
        projectTemplateId: obraPublica.id,
        parentId: task5_2.id,
        code: '5.2.1',
        name: 'Contrapiso',
        category: 'ITEM',
        unit: 'm2',
        defaultQuantity: new Decimal(0),
        sortOrder: 1,
      },
      {
        projectTemplateId: obraPublica.id,
        parentId: task5_2.id,
        code: '5.2.2',
        name: 'Cerámicos',
        category: 'ITEM',
        unit: 'm2',
        defaultQuantity: new Decimal(0),
        sortOrder: 2,
      },
    ],
  })

  const task5_3 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: phase5.id,
      code: '5.3',
      name: 'Pintura',
      category: 'TASK',
      sortOrder: 3,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPublica.id,
      parentId: task5_3.id,
      code: '5.3.1',
      name: 'Pintura látex interior',
      category: 'ITEM',
      unit: 'm2',
      defaultQuantity: new Decimal(0),
      sortOrder: 1,
    },
  })

  // 3. OBRA PRIVADA (sortOrder 2)
  const obraPrivada = await prisma.projectTemplate.upsert({
    where: { id: 'template-obra-privada' },
    create: {
      id: 'template-obra-privada',
      name: 'Obra Privada',
      description: 'Template para proyectos de obra privada residencial o comercial',
      category: 'RESIDENTIAL',
      sortOrder: 2,
    },
    update: {},
  })

  const opPhase1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPrivada.id,
      code: '1',
      name: 'PRELIMINARES',
      category: 'PHASE',
      sortOrder: 1,
    },
  })

  const opTask1_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPrivada.id,
      parentId: opPhase1.id,
      code: '1.1',
      name: 'Limpieza',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPrivada.id,
      parentId: opTask1_1.id,
      code: '1.1.1',
      name: 'Limpieza de terreno',
      category: 'ITEM',
      unit: 'm2',
      defaultQuantity: new Decimal(0),
      sortOrder: 1,
    },
  })

  const opPhase2 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPrivada.id,
      code: '2',
      name: 'ESTRUCTURA',
      category: 'PHASE',
      sortOrder: 2,
    },
  })

  const opTask2_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPrivada.id,
      parentId: opPhase2.id,
      code: '2.1',
      name: 'Fundaciones',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPrivada.id,
      parentId: opTask2_1.id,
      code: '2.1.1',
      name: 'Hormigón armado',
      category: 'ITEM',
      unit: 'm3',
      defaultQuantity: new Decimal(0),
      sortOrder: 1,
    },
  })

  const opPhase3 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPrivada.id,
      code: '3',
      name: 'INSTALACIONES Y TERMINACIONES',
      category: 'PHASE',
      sortOrder: 3,
    },
  })

  const opTask3_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: obraPrivada.id,
      parentId: opPhase3.id,
      code: '3.1',
      name: 'Instalaciones',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.createMany({
    data: [
      {
        projectTemplateId: obraPrivada.id,
        parentId: opTask3_1.id,
        code: '3.1.1',
        name: 'Eléctrica',
        category: 'ITEM',
        unit: 'm',
        defaultQuantity: new Decimal(0),
        sortOrder: 1,
      },
      {
        projectTemplateId: obraPrivada.id,
        parentId: opTask3_1.id,
        code: '3.1.2',
        name: 'Sanitaria',
        category: 'ITEM',
        unit: 'm',
        defaultQuantity: new Decimal(0),
        sortOrder: 2,
      },
    ],
  })

  // 4. AMPLIACIÓN COCINA
  const ampliacionCocina = await prisma.projectTemplate.upsert({
    where: { id: 'template-ampliacion-cocina' },
    create: {
      id: 'template-ampliacion-cocina',
      name: 'Ampliación Cocina',
      description: 'Template para ampliación de cocina residencial',
      category: 'RESIDENTIAL',
      sortOrder: 3,
    },
    update: {},
  })

  // 5. AMPLIACIÓN BAÑO
  const ampliacionBano = await prisma.projectTemplate.upsert({
    where: { id: 'template-ampliacion-bano' },
    create: {
      id: 'template-ampliacion-bano',
      name: 'Ampliación Baño',
      description: 'Template para ampliación o refacción de baño residencial',
      category: 'RESIDENTIAL',
      sortOrder: 4,
    },
    update: {},
  })

  const abPhase1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionBano.id,
      code: '1',
      name: 'DEMOLICIÓN',
      category: 'PHASE',
      sortOrder: 1,
    },
  })

  const abTask1_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionBano.id,
      parentId: abPhase1.id,
      code: '1.1',
      name: 'Demolición de revestimientos',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionBano.id,
      parentId: abTask1_1.id,
      code: '1.1.1',
      name: 'Demolición cerámicos',
      category: 'ITEM',
      unit: 'm2',
      defaultQuantity: new Decimal(8),
      sortOrder: 1,
    },
  })

  const abPhase2 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionBano.id,
      code: '2',
      name: 'INSTALACIONES',
      category: 'PHASE',
      sortOrder: 2,
    },
  })

  const abTask2_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionBano.id,
      parentId: abPhase2.id,
      code: '2.1',
      name: 'Instalación sanitaria',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.createMany({
    data: [
      {
        projectTemplateId: ampliacionBano.id,
        parentId: abTask2_1.id,
        code: '2.1.1',
        name: 'Bajadas de agua',
        category: 'ITEM',
        unit: 'm',
        defaultQuantity: new Decimal(6),
        sortOrder: 1,
      },
      {
        projectTemplateId: ampliacionBano.id,
        parentId: abTask2_1.id,
        code: '2.1.2',
        name: 'Desagües',
        category: 'ITEM',
        unit: 'm',
        defaultQuantity: new Decimal(5),
        sortOrder: 2,
      },
    ],
  })

  const abPhase3 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionBano.id,
      code: '3',
      name: 'TERMINACIONES',
      category: 'PHASE',
      sortOrder: 3,
    },
  })

  const abTask3_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionBano.id,
      parentId: abPhase3.id,
      code: '3.1',
      name: 'Revestimientos',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.createMany({
    data: [
      {
        projectTemplateId: ampliacionBano.id,
        parentId: abTask3_1.id,
        code: '3.1.1',
        name: 'Cerámicos pared',
        category: 'ITEM',
        unit: 'm2',
        defaultQuantity: new Decimal(15),
        sortOrder: 1,
      },
      {
        projectTemplateId: ampliacionBano.id,
        parentId: abTask3_1.id,
        code: '3.1.2',
        name: 'Cerámicos piso',
        category: 'ITEM',
        unit: 'm2',
        defaultQuantity: new Decimal(8),
        sortOrder: 2,
      },
    ],
  })

  const ampPhase1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionCocina.id,
      code: '1',
      name: 'DEMOLICIÓN Y PREPARACIÓN',
      category: 'PHASE',
      sortOrder: 1,
    },
  })

  const ampTask1_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionCocina.id,
      parentId: ampPhase1.id,
      code: '1.1',
      name: 'Demolición de muro existente',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionCocina.id,
      parentId: ampTask1_1.id,
      code: '1.1.1',
      name: 'Demolición parcial de muro',
      category: 'ITEM',
      unit: 'm2',
      defaultQuantity: new Decimal(10),
      sortOrder: 1,
    },
  })

  const ampPhase2 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionCocina.id,
      code: '2',
      name: 'ESTRUCTURA',
      category: 'PHASE',
      sortOrder: 2,
    },
  })

  const ampTask2_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionCocina.id,
      parentId: ampPhase2.id,
      code: '2.1',
      name: 'Ampliación de estructura',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionCocina.id,
      parentId: ampTask2_1.id,
      code: '2.1.1',
      name: 'Columnas y vigas',
      category: 'ITEM',
      unit: 'm3',
      defaultQuantity: new Decimal(2),
      sortOrder: 1,
    },
  })

  const ampPhase3 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionCocina.id,
      code: '3',
      name: 'INSTALACIONES',
      category: 'PHASE',
      sortOrder: 3,
    },
  })

  const ampTask3_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionCocina.id,
      parentId: ampPhase3.id,
      code: '3.1',
      name: 'Instalación eléctrica',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionCocina.id,
      parentId: ampTask3_1.id,
      code: '3.1.1',
      name: 'Tomacorrientes',
      category: 'ITEM',
      unit: 'un',
      defaultQuantity: new Decimal(8),
      sortOrder: 1,
    },
  })

  const ampTask3_2 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionCocina.id,
      parentId: ampPhase3.id,
      code: '3.2',
      name: 'Instalación sanitaria',
      category: 'TASK',
      sortOrder: 2,
    },
  })

  await prisma.wbsTemplate.createMany({
    data: [
      {
        projectTemplateId: ampliacionCocina.id,
        parentId: ampTask3_2.id,
        code: '3.2.1',
        name: 'Bajada de agua',
        category: 'ITEM',
        unit: 'm',
        defaultQuantity: new Decimal(5),
        sortOrder: 1,
      },
      {
        projectTemplateId: ampliacionCocina.id,
        parentId: ampTask3_2.id,
        code: '3.2.2',
        name: 'Desagües',
        category: 'ITEM',
        unit: 'm',
        defaultQuantity: new Decimal(8),
        sortOrder: 2,
      },
    ],
  })

  const ampPhase4 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionCocina.id,
      code: '4',
      name: 'TERMINACIONES',
      category: 'PHASE',
      sortOrder: 4,
    },
  })

  const ampTask4_1 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionCocina.id,
      parentId: ampPhase4.id,
      code: '4.1',
      name: 'Mesada y muebles',
      category: 'TASK',
      sortOrder: 1,
    },
  })

  await prisma.wbsTemplate.createMany({
    data: [
      {
        projectTemplateId: ampliacionCocina.id,
        parentId: ampTask4_1.id,
        code: '4.1.1',
        name: 'Mesada de granito',
        category: 'ITEM',
        unit: 'm',
        defaultQuantity: new Decimal(3),
        sortOrder: 1,
      },
      {
        projectTemplateId: ampliacionCocina.id,
        parentId: ampTask4_1.id,
        code: '4.1.2',
        name: 'Muebles bajo mesada',
        category: 'ITEM',
        unit: 'm',
        defaultQuantity: new Decimal(3),
        sortOrder: 2,
      },
    ],
  })

  const ampTask4_2 = await prisma.wbsTemplate.create({
    data: {
      projectTemplateId: ampliacionCocina.id,
      parentId: ampPhase4.id,
      code: '4.2',
      name: 'Revestimientos',
      category: 'TASK',
      sortOrder: 2,
    },
  })

  await prisma.wbsTemplate.createMany({
    data: [
      {
        projectTemplateId: ampliacionCocina.id,
        parentId: ampTask4_2.id,
        code: '4.2.1',
        name: 'Cerámicos de pared',
        category: 'ITEM',
        unit: 'm2',
        defaultQuantity: new Decimal(15),
        sortOrder: 1,
      },
      {
        projectTemplateId: ampliacionCocina.id,
        parentId: ampTask4_2.id,
        code: '4.2.2',
        name: 'Cerámicos de piso',
        category: 'ITEM',
        unit: 'm2',
        defaultQuantity: new Decimal(12),
        sortOrder: 2,
      },
    ],
  })

  // --- Budget resource templates (APU precargados por item WBS) ---
  await prisma.budgetResourceTemplate.deleteMany({
    where: {
      wbsTemplate: {
        projectTemplateId: { in: [obraPublica.id, obraPrivada.id, ampliacionCocina.id, ampliacionBano.id] },
      },
    },
  })

  const steelFrameWall = await prisma.wbsTemplate.findFirst({
    where: { projectTemplateId: obraPublica.id, code: '3.2.1' },
  })
  if (steelFrameWall) {
    await prisma.budgetResourceTemplate.createMany({
      data: [
        { wbsTemplateId: steelFrameWall.id, type: 'MATERIAL', name: 'Montante 70mm galvanizado', description: 'Perfil de acero galvanizado para estructura', unit: 'm', quantity: new Decimal(3), estimatedCost: new Decimal(850), sortOrder: 1 },
        { wbsTemplateId: steelFrameWall.id, type: 'MATERIAL', name: 'Riel 70mm galvanizado', description: 'Perfil horizontal para base y techo', unit: 'm', quantity: new Decimal(2), estimatedCost: new Decimal(750), sortOrder: 2 },
        { wbsTemplateId: steelFrameWall.id, type: 'MATERIAL', name: 'Tornillos autoperforantes', description: 'Para fijación de estructura', unit: 'un', quantity: new Decimal(20), estimatedCost: new Decimal(15), sortOrder: 3 },
        { wbsTemplateId: steelFrameWall.id, type: 'LABOR', name: 'Oficial especializado en Steel Frame', description: 'Montaje de estructura metálica', unit: 'h', quantity: new Decimal(0.5), estimatedCost: new Decimal(3000), sortOrder: 4 },
        { wbsTemplateId: steelFrameWall.id, type: 'LABOR', name: 'Ayudante', description: 'Asistente de montaje', unit: 'h', quantity: new Decimal(0.5), estimatedCost: new Decimal(2000), sortOrder: 5 },
      ],
    })
  }

  const drywall = await prisma.wbsTemplate.findFirst({
    where: { projectTemplateId: obraPublica.id, code: '3.2.2' },
  })
  if (drywall) {
    await prisma.budgetResourceTemplate.createMany({
      data: [
        { wbsTemplateId: drywall.id, type: 'MATERIAL', name: 'Placa de yeso estándar 12.5mm', description: 'Placa Durlock o similar', unit: 'placa', quantity: new Decimal(2), estimatedCost: new Decimal(1200), sortOrder: 1 },
        { wbsTemplateId: drywall.id, type: 'MATERIAL', name: 'Masilla para juntas', description: 'Masilla + cinta', unit: 'kg', quantity: new Decimal(0.5), estimatedCost: new Decimal(450), sortOrder: 2 },
        { wbsTemplateId: drywall.id, type: 'LABOR', name: 'Durlock especializado', description: 'Colocación y enduido', unit: 'h', quantity: new Decimal(0.8), estimatedCost: new Decimal(2800), sortOrder: 3 },
      ],
    })
  }

  const brickWall = await prisma.wbsTemplate.findFirst({
    where: { projectTemplateId: obraPublica.id, code: '3.3.1' },
  })
  if (brickWall) {
    await prisma.budgetResourceTemplate.createMany({
      data: [
        { wbsTemplateId: brickWall.id, type: 'MATERIAL', name: 'Ladrillo hueco 18cm', description: 'Ladrillo cerámico', unit: 'un', quantity: new Decimal(70), estimatedCost: new Decimal(85), sortOrder: 1 },
        { wbsTemplateId: brickWall.id, type: 'MATERIAL', name: 'Cemento', description: 'Portland común', unit: 'bolsa', quantity: new Decimal(0.15), estimatedCost: new Decimal(4500), sortOrder: 2 },
        { wbsTemplateId: brickWall.id, type: 'MATERIAL', name: 'Arena', description: 'Arena fina para mezcla', unit: 'm3', quantity: new Decimal(0.025), estimatedCost: new Decimal(12000), sortOrder: 3 },
        { wbsTemplateId: brickWall.id, type: 'LABOR', name: 'Oficial albañil', description: 'Levantamiento de muro', unit: 'h', quantity: new Decimal(1.2), estimatedCost: new Decimal(2500), sortOrder: 4 },
        { wbsTemplateId: brickWall.id, type: 'LABOR', name: 'Ayudante', unit: 'h', quantity: new Decimal(1.2), estimatedCost: new Decimal(1800), sortOrder: 5 },
      ],
    })
  }

  const electricalPanel = await prisma.wbsTemplate.findFirst({
    where: { projectTemplateId: obraPublica.id, code: '4.1.1' },
  })
  if (electricalPanel) {
    await prisma.budgetResourceTemplate.createMany({
      data: [
        { wbsTemplateId: electricalPanel.id, type: 'MATERIAL', name: 'Tablero eléctrico 12 bocas', description: 'Tablero de empotrar IP65', unit: 'un', quantity: new Decimal(1), estimatedCost: new Decimal(18000), sortOrder: 1 },
        { wbsTemplateId: electricalPanel.id, type: 'MATERIAL', name: 'Disyuntor termomagnético 40A', unit: 'un', quantity: new Decimal(1), estimatedCost: new Decimal(8500), sortOrder: 2 },
        { wbsTemplateId: electricalPanel.id, type: 'MATERIAL', name: 'Disyuntor diferencial 40A 30mA', unit: 'un', quantity: new Decimal(1), estimatedCost: new Decimal(12000), sortOrder: 3 },
        { wbsTemplateId: electricalPanel.id, type: 'LABOR', name: 'Electricista matriculado', unit: 'h', quantity: new Decimal(4), estimatedCost: new Decimal(4000), sortOrder: 4 },
      ],
    })
  }

  const ceramics = await prisma.wbsTemplate.findFirst({
    where: { projectTemplateId: obraPublica.id, code: '5.2.2' },
  })
  if (ceramics) {
    await prisma.budgetResourceTemplate.createMany({
      data: [
        { wbsTemplateId: ceramics.id, type: 'MATERIAL', name: 'Cerámico 45x45 cm', description: 'Cerámico esmaltado primera calidad', unit: 'm2', quantity: new Decimal(1.05), estimatedCost: new Decimal(3500), supplierName: 'Cerámicos Norte', sortOrder: 1 },
        { wbsTemplateId: ceramics.id, type: 'MATERIAL', name: 'Adhesivo cementicio', description: 'Pegamento para cerámicos', unit: 'bolsa', quantity: new Decimal(0.3), estimatedCost: new Decimal(1800), sortOrder: 2 },
        { wbsTemplateId: ceramics.id, type: 'MATERIAL', name: 'Pastina', description: 'Para juntas', unit: 'kg', quantity: new Decimal(0.5), estimatedCost: new Decimal(650), sortOrder: 3 },
        { wbsTemplateId: ceramics.id, type: 'LABOR', name: 'Colocador de cerámicos', unit: 'h', quantity: new Decimal(1), estimatedCost: new Decimal(3000), sortOrder: 4 },
      ],
    })
  }

  console.log('Templates seeded successfully!')
}

seedTemplates()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

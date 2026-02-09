/**
 * Seed WBS templates from "Modelo Presupuesto Oficial" (Designación del Item).
 * All items are added as root-level (parentId: null) so they appear in "Agregar fase".
 * Duplicates by name (case-insensitive) are skipped.
 */
import { prisma } from './client'
import { Decimal } from '@prisma/client/runtime/library'

const PRESUPUESTO_OFICIAL_TEMPLATE_ID = 'template-presupuesto-oficial'

const ITEMS: string[] = [
  // TAREAS COMPLEMENTARIAS
  'TAREAS COMPLEMENTARIAS',
  'PREPARACIÓN DEL TERRENO Y REPLANTEO',
  'Limpieza del Terreno',
  'Demoliciones y erradicación de obstáculos',
  'Demolición de edificio existente',
  'Creación de formaletas',
  'Verificación de medidas y replanteo',
  'LEY DE HIGIENE Y SEGURIDAD',
  'Presentación de Documentación y Plan de HyS aprobado',
  'Servicios de HyS durante la ejecución de la obra',
  'DOCUMENTACIÓN TÉCNICA MUNICIPAL, EJECUTIVA Y APORTES',
  'Documentación Técnica Ejecutiva aprobada por la Dir. de Obra',
  'Documentación Técnica Municipal y otros Entes',
  'Aportes Previsionales Profesionales',
  'PUESTA EN MARCHA',
  'Entrega de manuales de operación y mantenimiento de la obra',
  'Capacitación del personal de mantenimiento y puesta en funcionamiento',
  'Entrega de Documentación Técnica Conforme a Obra para aprobación',
  'Restauración completa de bienes frente al público',
  // AISLACIONES
  'AISLACIONES',
  'AISLACIÓN HIDRÓFUGA',
  'Capa aisladora horizontal y vertical en mampostería',
  'Pintura ignífuga en estructuras en contacto con el suelo',
  'Pintura / Membrana / Geotextil / Carpeta en cubiertas de losa',
  // REVOQUES Y ENLUCIDOS
  'REVOQUES Y ENLUCIDOS',
  'Grueso impermeable',
  'Grueso y fino',
  // CUBIERTAS DE TECHO
  'CUBIERTAS DE TECHO',
  'Fenólico de 16mm',
  'Zinguería: cenefas, babets y goteros metálicos',
  'Panel metálico trapezoidal con aislación en poliuretano',
  // CONTRAFISOS DE HP INTERIORES
  'CONTRAFISOS DE HP INTERIORES',
  'Contrapiso armado sobre terreno nivelado y compactado (espesor 8cm)',
  'Hormigón llenado',
  // PISOS Y PAVIMENTOS
  'PISOS Y PAVIMENTOS',
  'PISOS INTERIORES',
  'Baldosa de granito compacto pulido 40x40cm',
  'Tepetes desodorizadores',
  'PISOS EXTERIORES',
  'Baldosa de granito compacto pulido (40x40 cm) antideslizante',
  'Adoquines de hormigón intertrabado',
  'Carpeta de hormigón armado',
  'Piso epoxi sobre hormigón',
  // ZÓCALOS
  'ZÓCALOS',
  'INTERIORES',
  'Granítico h=8, 10cm',
  'EXTERIORES',
  'Cerámico',
  'Rehundido de hormigón liso',
  // TABIQUES LIVIANOS
  'TABIQUES LIVIANOS',
  'TABIQUES CERRAMIENTO EXTERIOR',
  'Panel metálico con núcleo aislante de poliuretano de alta densidad',
  'TABIQUES CERRAMIENTO INTERIOR',
  'Tabiques de placa de roca de yeso',
  // CIELORRASOS
  'CIELORRASOS',
  'Suspendido de paneles de materiales acústicos',
  // REVESTIMIENTOS
  'REVESTIMIENTOS',
  'INTERIORES',
  'Porcelanatos 60x60 cm',
  // CARPINTERÍAS
  'CARPINTERÍAS',
  'ALUMINIO Y VIDRIO',
  'Ventanas fijas/corredizas con vidrio 3+3 laminado',
  'METÁLICA',
  'Portones de abrir con marco y contramarco',
  'Portón sala de tanques y sala de bombas',
  'Puerta metálica con marco y contramarco aislada e insonorizada',
  'VIDRIOS Y ESPEJOS',
  'Vidrios herméticos D.V.H de seguridad',
  'Espejos (esp. 3mm)',
  'BARRAL ANTIPÁNICO',
  'Barral antipánico',
  // HERRERÍAS
  'HERRERÍAS',
  'REJAS',
  'Caño estructural y metal desplegado',
  'Rejas y caídas',
  'BARANDAS',
  'Acero inoxidable',
  // PINTURAS
  'PINTURAS',
  'PINTURA INTERIOR',
  'Latex satinado',
  'Antióxido y esmalte sintético (en metales)',
  'PINTURA EXTERIOR',
  'Impermeabilizante de hormigón visto',
  // EQUIPAMIENTO
  'EQUIPAMIENTO',
  'EQUIPAMIENTO INTERIOR',
  'Mesada granito natural y zócalo',
  'Muebles bajo mesada, alacena',
  'Mostrador y mesa de informes',
  'Cortinas de tela vinílica (tipo roller)',
  'Dispensar de alcohol en gel',
  'EQUIPAMIENTO EXTERIOR',
  'Cesto de residuos',
  'Bicicleteros',
  'Mural',
  'EQUIPAMIENTO MÓVIL',
  'Sillas, Taburetes, etc.',
  'Sillas altas para mostrador',
  'Escritorios',
  'Mesas rectangulares',
  'Estantes metálicos',
  'Armarios metálicos',
  'Pizarrones',
  'Heladera',
  // OBRAS EXTERIORES
  'OBRAS EXTERIORES',
  'Veredas de hormigón armado, acceso, rampa para discapacitados',
  'Puentes de hormigón armado vehiculares y peatonales, rampas',
  'Casetas para arbolado público',
  // ESPACIOS VERDES
  'ESPACIOS VERDES INTERIORES Y PÚBLICOS',
  'JARDINERÍA Y PAISAJISMO',
  'Tierra fertilizada',
  'Corteza',
  'Geotextil',
  'CANIL ESTABLECIDO CON PLANTAS',
  'Maceteros, canteros, etc. con plantas',
  'ARBOLADO',
  'Arbolado',
  // LIMPIEZA
  'LIMPIEZA DE OBRA',
  'Limpieza periódica y final',
  // MOVIMIENTOS DE SUELOS
  'MOVIMIENTOS DE SUELOS',
  'Excavaciones fundaciones',
  'Estudio de suelos',
  // ESTRUCTURAS HORMIGÓN
  'ESTRUCTURAS DE HORMIGÓN ARMADO',
  'H° de limpieza bajo estructuras de fundación',
  'Zapatas corridas, plateas, bases aisladas. Cimientos de H° Cº',
  'Vigas de fundación',
  'Columnas',
  'Tabiques',
  'Losa de hormigón armado con nervios unidireccionales y bidireccionales',
  'Losa maciza',
  // ESTRUCTURAS METÁLICAS
  'ESTRUCTURAS METÁLICAS',
  'Vigas - Correas - Diagonales - Tensores',
  // MAMPOSTERÍA
  'MAMPOSTERÍA',
  'Mampostería con ladrillos huecos armados',
  // INSTALACIÓN ELÉCTRICA CORRIENTES FUERTES
  'INSTALACIÓN ELÉCTRICA CORRIENTES FUERTES',
  'Canalizaciones',
  'Conductores',
  'Llaves, Interruptores y tomacorrientes',
  'Tomacorrientes',
  'Tableros',
  'Medidor de conexión',
  'Puesta a tierra',
  'Sistema de descarga atmosférica',
  'Iluminación',
  'Acometida',
  // EQUIPOS ELÉCTRICOS
  'EQUIPOS ELÉCTRICOS',
  'Extractor',
  'Timbre y portero',
  'Secamanos',
  'Bombas de agua',
  'Termotanques eléctricos',
  // INSTALACIÓN ELÉCTRICA CORRIENTES DÉBILES
  'INSTALACIÓN ELÉCTRICA CORRIENTES DÉBILES',
  'CANALIZACIONES',
  'Bandeja portacables',
  'Caño PVC',
  'Caño metálico',
  'Caja rectangular metálica',
  'Cable coaxial PVC',
  'CABLEADO',
  'Fibra Óptica',
  'UTP',
  'Patch Cord',
  'SISTEMA DE SEGURIDAD',
  'DVR y accesorios',
  'Cámara Interior',
  'Cámara Exterior',
  'PC servidor y monitoreo',
  'Control de acceso',
  'Portero Visor',
  'SISTEMA DE COMUNICACIÓN',
  'Rack y accesorios',
  'Switch',
  'Central telefónica',
  'UPS',
  'Puesto de trabajo',
  'Teléfono',
  'Access Point',
  'HDMI',
  'SISTEMA DE CONTROL',
  'Reloj Horario',
  'CONFIGURACIÓN, PRUEBAS Y PUESTA EN MARCHA',
  'Certificado de desafección',
  // INSTALACIÓN TERMOMECÁNICA
  'INSTALACIÓN TERMOMECÁNICA',
  'EQUIPAMIENTO TERMOMECÁNICO',
  'Equipos splits',
  'TUBERÍAS',
  'Provisión y montaje de tuberías de cobre',
  'Provisión y montaje de conductos de aire acondicionado',
  // INSTALACIÓN SANITARIA
  'INSTALACIÓN SANITARIA',
  'CLOACAL',
  'Conexiones externas',
  'Cañerías primarias y accesorios',
  'Cañerías secundarias y accesorios',
  'Cañerías de ventilación',
  'Puntos de aplique, bocas de acceso, bocas de inspección, rejillas de piso',
  'Cámara de inspección',
  'DESAGÜES PLUVIALES',
  'Embudos y bajadas',
  'Cañerías horizontales enterradas, zócalos, rejillas y accesorios',
  'Realización de cunetas y vados',
  'Conexiones externas a desagües, rejillas, puntos de infiltración',
  'INSTALACIÓN AGUA FRÍA Y CALIENTE',
  'Provisión y colocación cañerías de alimentación y equipamiento',
  'Provisión y colocación cisterna, tanques de reserva de agua',
  'Provisión y colocación cañerías de distribución hasta artefactos',
  'Artefactos y griferías: inodoro, bidet',
  'Artefactos y griferías: lavatorio',
  'Artefactos y griferías: kit completo lavatorio e inodoro de loza',
  'Artefactos y griferías: kit accesorios de baños',
  'Artefactos y griferías: kit accesorios de baños para personas con movilidad reducida',
  'Conexiones cromadas para bidet y artefactos, con llaves de corte',
  'Duchas',
  'Pileta de acero inoxidable y grifería',
  'Canillas de servicio',
  'Rejillas de piso y tapas ciegas',
  'Provisión de otros equipos y accesorios (ablandador de agua)',
  // SISTEMA CONTRA INCENDIOS
  'SISTEMA CONTRA INCENDIOS',
  'INSTALACIÓN SECA',
  'Matafuegos ABC',
  'Matafuegos BC',
  'Carteles de señalización de salida y extintores',
  'Señalización de extintores',
  'SISTEMA SEGURIDAD',
  'Central de alarmas',
  'Pulsadores',
  'Detectores Sirenas',
  'DETECTORES',
  'Detector de humo',
  'Detector de gas',
  'Detector de temperatura',
  // INSTALACIÓN DE GAS
  'INSTALACIÓN DE GAS',
  'EXTENSIÓN DE RED: CONEXIÓN EXTERNA - MEDIDOR - REGULADOR',
  'Conexión externa',
  'Gabinete de medición y cuadro de regulación',
  'CAÑERÍAS',
  'Cañerías diam 1 1/4"',
  'Cañerías diam 1"',
  'Cañerías diam 3/4"',
  'Cañerías diam 1/2"',
  'Ventilaciones',
  'ARTEFACTOS',
  'Anafes',
  'Cocina común / Cocina industrial',
  // SEÑALÉTICA
  'SEÑALÉTICA',
  'SEÑALÉTICA INTERIOR',
  'Tótem ingreso al establecimiento',
  'Indicadores individuales',
  'Información',
  'Indicación sanitarios y administración',
  'Indicadores circulación aérea',
  'Indicadores ciegos',
  'Indicadores cromáticos',
  'Pinturas puertas',
  'Vinilos',
  'Gráficas Muros Comedor',
  'SEÑALÉTICA EXTERIOR',
  'Placa inaugural',
  'Carteles con o sin doble faz',
  'Estacionamiento',
  'Tótem ingreso general',
  'Corpóreo nombre institucional',
]

async function seedPresupuestoOficial() {
  console.log('Seeding Presupuesto Oficial (Modelo Presupuesto Oficial)...')

  const template = await prisma.projectTemplate.upsert({
    where: { id: PRESUPUESTO_OFICIAL_TEMPLATE_ID },
    create: {
      id: PRESUPUESTO_OFICIAL_TEMPLATE_ID,
      name: 'Presupuesto Oficial',
      description: 'Items del modelo de presupuesto oficial (Designación del Item)',
      category: 'OFFICIAL',
      sortOrder: 10,
    },
    update: {},
  })

  const existing = await prisma.wbsTemplate.findMany({
    where: { projectTemplateId: template.id },
    select: { name: true },
  })
  const existingNames = new Set(
    existing.map((e) => e.name.toLowerCase().trim())
  )

  let created = 0
  let skipped = 0

  for (let i = 0; i < ITEMS.length; i++) {
    const name = ITEMS[i].trim()
    if (!name) continue

    const key = name.toLowerCase()
    if (existingNames.has(key)) {
      skipped++
      continue
    }

    const code = String(i + 1)
    await prisma.wbsTemplate.create({
      data: {
        projectTemplateId: template.id,
        parentId: null,
        code,
        name,
        category: 'TASK',
        unit: 'un',
        defaultQuantity: new Decimal(1),
        sortOrder: i + 1,
      },
    })
    existingNames.add(key)
    created++
  }

  console.log(
    `Presupuesto Oficial: ${created} items creados, ${skipped} duplicados omitidos.`
  )
}

seedPresupuestoOficial()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

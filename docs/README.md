# Construction ERP — Documentación

Índice de la documentación del proyecto. Estructura alineada con el [resumen ejecutivo](00-overview/final-summary.md) y los próximos pasos inmediatos.

---

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| **[00-overview](00-overview/)** | Resumen ejecutivo, índice rápido, README de documentación. |
| **[01-architecture](01-architecture/)** | Stack tecnológico, decisiones de arquitectura. |
| **[02-data-model](02-data-model/)** | ERD, schema Prisma (referencia), proveedores globales. **Schema en uso:** `packages/database/prisma/schema.prisma` (incluye proveedores globales). |
| **[03-business-requirements](03-business-requirements/)** | Requisitos de negocio, diseño del directorio de proveedores. |
| **[04-implementation](04-implementation/)** | Guías de implementación, Cursor, Prisma, code review, prompts. |
| **[05-frontend](05-frontend/)** | Arquitectura de frontend y plan de desarrollo (navegación, master plan). |

---

## Empezar aquí

1. **Resumen del proyecto:** [00-overview/final-summary.md](00-overview/final-summary.md)
2. **Stack y arquitectura:** [01-architecture/step2-tech-stack.md](01-architecture/step2-tech-stack.md)
3. **Modelo de datos:** [02-data-model/README.md](02-data-model/README.md) — schema fuente de verdad en `packages/database/prisma/schema.prisma`
4. **Implementación con Cursor:** [04-implementation/cursor-guide.md](04-implementation/cursor-guide.md)
5. **Code review y fixes:** [04-implementation/CODE-REVIEW.md](04-implementation/CODE-REVIEW.md)

---

## Schema Prisma (fuente de verdad)

- **Ubicación:** `packages/database/prisma/schema.prisma`
- **Recomendado:** Schema completo con **proveedores globales** (57 tablas: 51 base + 6 suppliers). Ver [02-data-model/README.md](02-data-model/README.md).

Los archivos en `docs/02-data-model/schema.prisma` son **copia de referencia**; no sustituyen al schema del paquete `@repo/database`.

# Arquitectura de Frontend - Bloqer

## Navegación Dual

El sistema tiene DOS contextos:

1. **Contexto Global** (Org-level)
   - Dashboard
   - Proyectos (lista)
   - Equipo
   - Inventario
   - Proveedores
   - Documentos
   - Configuración

2. **Contexto Proyecto** (Project-level)
   - Dashboard del proyecto
   - Presupuesto
   - Cronograma
   - Finanzas
   - Certificaciones
   - Calidad (RFI, Submittals)
   - Partes diarios
   - Documentos

## Rutas
```
/dashboard (global)
/projects (global)
/projects/[id] (proyecto - sidebar cambia)
/projects/[id]/budget
/projects/[id]/finance/transactions
...
```

## Componentes Clave

- `DynamicSidebar` - Cambia según contexto
- `GlobalSidebar` - Navegación org
- `ProjectSidebar` - Navegación proyecto
- `DashboardHeader` - Header con user menu
- `DynamicBreadcrumbs` - Breadcrumbs automáticos

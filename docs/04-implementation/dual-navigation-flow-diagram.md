# 🗺️ Diagrama de Flujo - Sistema de Navegación Dual

## Flujo de Navegación

```
┌─────────────────────────────────────────────────────────────────┐
│                        Usuario Inicia Sesión                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    /es/dashboard (INICIO)                        │
│                    📊 GLOBAL SIDEBAR                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────┐      ┌──────────┐      ┌──────────┐
   │Proyectos│      │Inventario│      │  Equipo  │
   └────┬────┘      └──────────┘      └──────────┘
        │
        │ Click en proyecto
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│              /es/projects/[uuid] (Overview)                      │
│              📊 GLOBAL SIDEBAR (todavía)                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Click en "Budget" (contenido)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│           /es/projects/[uuid]/budget                             │
│           🎯 PROJECT SIDEBAR (cambio automático)                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┬─────────────────┐
        │                  │                  │                 │
        ▼                  ▼                  ▼                 ▼
   ┌─────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
   │Presupuesto    │Cronograma│      │ Finanzas │      │Calidad   │
   │(activo)  │      │          │      │    ▼     │      │    ▼     │
   └─────────┘      └──────────┘      │ Trans.   │      │  RFIs    │
                                       │ Cert.    │      │Submittals│
                                       └──────────┘      └──────────┘
```

---

## Lógica de Detección

```
Usuario navega a URL
       │
       ▼
┌──────────────────────────────────────┐
│ DynamicSidebar detecta pathname      │
└──────────┬───────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│ ¿La URL contiene /projects/[uuid]/ con más segmentos?       │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
       NO  │                          SÍ  │
           ▼                              ▼
   ┌───────────────┐              ┌──────────────┐
   │ GlobalSidebar │              │ProjectSidebar│
   └───────────────┘              └──────────────┘
```

---

## Estructura de Componentes

```
DashboardLayout
│
├── DynamicSidebar (client)
│   │
│   ├── GlobalSidebar (client)
│   │   ├── Logo
│   │   ├── Nav Items (7)
│   │   └── Footer
│   │
│   └── ProjectSidebar (client)
│       ├── Back Button
│       ├── Project Name (dynamic)
│       ├── Nav Items (7)
│       │   ├── Main Item
│       │   └── Sub Items (expandible)
│       └── (no footer)
│
├── DashboardHeader (client)
│   ├── Org Name
│   ├── Notifications Button
│   └── UserMenuDropdown (client)
│       ├── Avatar
│       ├── Name/Email
│       ├── Settings Link
│       └── Logout Button
│
├── DynamicBreadcrumbs (client)
│   ├── Home Icon
│   └── Segments (dynamic)
│
└── Main Content (children)
```

---

## Rutas y Contextos

### Global Context (Global Sidebar)
```
/es/dashboard
/es/projects                    ← Lista de proyectos
/es/projects/new                ← Crear proyecto
/es/projects/[uuid]             ← Overview de proyecto (sin subrutas)
/es/team
/es/inventory
/es/suppliers
/es/documents
/es/settings
```

### Project Context (Project Sidebar)
```
/es/projects/[uuid]/budget
/es/projects/[uuid]/budget/new
/es/projects/[uuid]/budget/[versionId]
/es/projects/[uuid]/schedule
/es/projects/[uuid]/finance
/es/projects/[uuid]/finance/transactions
/es/projects/[uuid]/certifications
/es/projects/[uuid]/certifications/[certId]
/es/projects/[uuid]/quality
/es/projects/[uuid]/quality/rfis
/es/projects/[uuid]/quality/rfis/[rfiId]
/es/projects/[uuid]/quality/submittals
/es/projects/[uuid]/quality/submittals/[submittalId]
/es/projects/[uuid]/daily-reports
/es/projects/[uuid]/documents
/es/projects/[uuid]/wbs
/es/projects/[uuid]/change-orders
/es/projects/[uuid]/change-orders/[coId]
```

---

## Estados de Navegación

### Item Activo
```tsx
const isActive = 
  pathname === item.href ||                    // Exact match
  (item.href !== '/dashboard' &&               // Not dashboard
   pathname.startsWith(item.href))             // Starts with href
```

### Sección Expandida
```tsx
const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

// Auto-expand cuando pathname coincide
useEffect(() => {
  const activeSection = navigation.find(item => 
    item.children && pathname.startsWith(item.href)
  )
  if (activeSection) {
    setExpandedSections(prev => new Set(prev).add(activeSection.href))
  }
}, [pathname])
```

---

## Ejemplo de Navegación Completa

```
1. Usuario → Login → /es/dashboard
   Sidebar: GLOBAL
   Active: Dashboard
   
2. Click "Proyectos" → /es/projects
   Sidebar: GLOBAL (sin cambios)
   Active: Proyectos
   Breadcrumbs: Home / Proyectos
   
3. Click proyecto "Torre Alpha" → /es/projects/abc-123
   Sidebar: GLOBAL (todavía, es la página overview)
   Active: Proyectos
   Breadcrumbs: Home / Proyectos / Torre Alpha
   
4. Click "Budget" (en contenido) → /es/projects/abc-123/budget
   Sidebar: PROJECT (cambio automático!) 🎯
   Active: Presupuesto
   Project Name: Torre Alpha (cargado de API)
   Breadcrumbs: Home / Proyectos / Torre Alpha / Presupuesto
   
5. Click "Finanzas" → /es/projects/abc-123/finance
   Sidebar: PROJECT (sin cambios)
   Active: Finanzas
   Expanded: No
   
6. Click flecha junto a "Finanzas" → (expand)
   Sub-items visibles: Transacciones, Certificaciones
   Expanded: Sí
   
7. Click "Transacciones" → /es/projects/abc-123/finance/transactions
   Sidebar: PROJECT (sin cambios)
   Active: Transacciones (sub-item)
   Parent Active: Finanzas
   Expanded: Sí (se mantiene)
   
8. Click "Volver a Proyectos" → /es/projects
   Sidebar: GLOBAL (cambio automático!) 🎯
   Active: Proyectos
```

---

## Casos Edge

### Edge Case 1: Proyecto no encontrado
```
URL: /es/projects/invalid-uuid/budget
API: 404
Sidebar: PROJECT (se muestra de todos modos)
Project Name: "Proyecto" (fallback)
Contenido: 404 page
```

### Edge Case 2: New project
```
URL: /es/projects/new
Sidebar: GLOBAL ✅ (detecta id="new" y no cambia)
Active: Proyectos
```

### Edge Case 3: Deep link directo
```
URL: /es/projects/abc-123/quality/rfis/rfi-456
Sidebar: PROJECT ✅
Active: RFIs (sub-item)
Expanded: Calidad ✅ (auto-expand)
Project Name: (loading...) → Torre Alpha
```

---

## Traducciones

```typescript
// es.json
{
  "nav": {
    "dashboard": "Tablero",
    "projects": "Proyectos",
    "team": "Equipo",
    "projectDashboard": "Dashboard del Proyecto",
    "budget": "Presupuesto",
    "schedule": "Cronograma",
    "finance": "Finanzas",
    "transactions": "Transacciones",
    "certifications": "Certificaciones",
    "quality": "Calidad",
    "rfis": "RFIs",
    "submittals": "Submittals",
    "dailyReports": "Partes Diarios",
    "backToProjects": "Volver a Proyectos",
    "logout": "Cerrar Sesión"
  }
}
```

---

## Performance

### Optimizaciones Implementadas
- ✅ Client components donde se necesitan (usePathname, useState)
- ✅ Server components para layout base
- ✅ Fetch de proyecto solo cuando es necesario
- ✅ Estados locales (no context/redux innecesario)
- ✅ CSS classes computadas solo cuando cambia pathname

### Future Optimizations
- [ ] Suspense boundaries para carga de proyecto
- [ ] Prefetch de rutas comunes
- [ ] Memoization de navigation arrays
- [ ] Virtual scrolling si muchos items

---

**Última actualización**: 2025-02-01

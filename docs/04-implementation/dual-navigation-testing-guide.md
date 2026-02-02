# 🧪 Guía de Testing - Sistema de Navegación Dual

## 🚀 Inicio Rápido

```bash
# Desde la raíz del proyecto
pnpm dev

# Abrir navegador en:
http://localhost:3000
```

## ✅ Checklist de Testing

### 1. Verificación Visual Inicial

#### Contexto Global
- [ ] Navegar a `/es/dashboard`
- [ ] Verificar que aparece el **Global Sidebar** (fondo oscuro)
- [ ] Verificar 7 items en el sidebar:
  - Dashboard
  - Proyectos
  - Equipo
  - Inventario
  - Proveedores
  - Documentos
  - Configuración
- [ ] Verificar que "Dashboard" está destacado (bg-slate-800)

#### Header
- [ ] Verificar que aparece el nombre de la organización
- [ ] Verificar botón de notificaciones (con punto rojo)
- [ ] Verificar user menu (avatar con iniciales)

#### Breadcrumbs
- [ ] En `/dashboard` → No hay breadcrumbs (o solo home)
- [ ] En `/projects` → Aparece "Home / Proyectos"
- [ ] Último item en negrita

---

### 2. Navegación Global

#### Test 1: Navegación entre secciones
```
1. Click en "Proyectos" → URL: /es/projects
2. Verificar que "Proyectos" está destacado
3. Verificar breadcrumbs: Home / Proyectos
4. Click en "Inventario" → URL: /es/inventory
5. Verificar que "Inventario" está destacado
6. Click en "Dashboard" → Volver al inicio
```

#### Test 2: Persistencia del sidebar
```
1. Desde /dashboard, click en "Equipo"
2. Verificar que el Global Sidebar permanece
3. Navegar a varias secciones globales
4. El sidebar NO debe cambiar
```

---

### 3. Contexto de Proyecto

#### Test 3: Entrar a un proyecto
```
1. Ir a /es/projects
2. Click en cualquier proyecto de la lista
3. Llegar a /es/projects/[uuid]
4. Verificar que TODAVÍA está el Global Sidebar (página overview)
5. Click en "Budget" en el contenido
6. 🎯 El sidebar DEBE cambiar a Project Sidebar
```

#### Test 4: Project Sidebar
```
1. Estar en /es/projects/[uuid]/budget
2. Verificar Project Sidebar con:
   - Botón "Volver a Proyectos" (arriba)
   - Nombre del proyecto (cargado dinámicamente)
   - 7 secciones principales:
     ✓ Dashboard del Proyecto
     ✓ Presupuesto (activo)
     ✓ Cronograma
     ✓ Finanzas (con flecha ▶)
     ✓ Calidad (con flecha ▶)
     ✓ Partes Diarios
     ✓ Documentos
```

#### Test 5: Secciones expandibles
```
1. Estar en /es/projects/[uuid]/budget
2. Click en "Finanzas" (el texto, no la flecha)
   → Navegar a página de finanzas
3. Click en la flecha junto a "Finanzas"
   → Expandir sección
4. Ver sub-items:
   - Transacciones
   - Certificaciones
5. Click en "Transacciones"
   → Navegar y verificar activo
6. Verificar que "Finanzas" permanece expandida
```

#### Test 6: Auto-expand
```
1. Navegar directamente a /es/projects/[uuid]/quality/rfis
2. Verificar que la sección "Calidad" está AUTO-EXPANDIDA
3. Verificar que "RFIs" está activo
```

#### Test 7: Volver a Global
```
1. Estar en cualquier ruta de proyecto
2. Click en "Volver a Proyectos" (arriba del sidebar)
3. 🎯 Volver a /es/projects
4. 🎯 El sidebar DEBE cambiar a Global Sidebar
```

---

### 4. Breadcrumbs Dinámicos

#### Test 8: Breadcrumbs en proyecto
```
1. /es/projects → "Home / Proyectos"
2. /es/projects/[uuid]/budget → "Home / Proyectos / [nombre] / Presupuesto"
3. /es/projects/[uuid]/quality/rfis → "Home / Proyectos / [nombre] / Calidad / RFIs"
4. Todos los items son clickeables EXCEPTO el último
5. Click en "Calidad" → Navegar a /quality
```

---

### 5. User Menu

#### Test 9: Dropdown funcional
```
1. Click en el avatar/nombre (esquina superior derecha)
2. Ver dropdown con:
   - Nombre completo
   - Email
   - "Configuración" (con icono)
   - "Cerrar Sesión" (en rojo)
3. Hover en "Configuración" → Cambio de color
4. Click en "Cerrar Sesión"
5. 🎯 Debe hacer logout y redirigir a /login
```

---

### 6. Responsive & UX

#### Test 10: Scroll
```
1. Entrar a una página con mucho contenido
2. Scroll hacia abajo en el contenido principal
3. Verificar que:
   - Sidebar permanece fijo
   - Header permanece fijo
   - Solo el contenido hace scroll
```

#### Test 11: Overflow del sidebar
```
1. Si hay muchos items (futuro)
2. Verificar scroll vertical en el sidebar
3. Header y footer del sidebar deben permanecer fijos
```

---

### 7. Rutas de Proyecto Nuevas

#### Test 12: Páginas placeholder
```
✓ /es/projects/[uuid]/schedule → "Cronograma"
✓ /es/projects/[uuid]/finance → "Finanzas" (overview)
✓ /es/projects/[uuid]/finance/transactions → "Transacciones"
✓ /es/projects/[uuid]/daily-reports → "Partes Diarios"
```

Cada una debe:
- Mostrar el Project Sidebar correcto
- Item correspondiente activo
- Breadcrumbs correctos
- Contenido placeholder visible

---

### 8. Traducciones

#### Test 13: Todo en español
```
Verificar que TODOS los textos estén en español:
- Items del sidebar
- Breadcrumbs
- User menu ("Cerrar Sesión", no "Logout")
- Placeholders de páginas
```

---

## 🐛 Casos Edge

### Edge Case 1: Proyecto no encontrado
```
1. Navegar a /es/projects/uuid-invalido/budget
2. Debe mostrar 404
3. Sidebar debe manejar el error gracefully
```

### Edge Case 2: Ruta /projects/new
```
1. Ir a /es/projects/new
2. 🎯 Debe mostrar Global Sidebar (no Project)
3. No debe intentar cargar proyecto con id="new"
```

### Edge Case 3: Ruta /projects/[uuid] (sin subrutas)
```
1. Ir a /es/projects/[uuid] (página overview)
2. 🎯 Debe mostrar Global Sidebar aún
3. Solo al entrar a subrutas (budget, etc.) cambia a Project
```

---

## ✅ Resultados Esperados

### Éxito Total Si:
- [x] Global Sidebar aparece en rutas globales
- [x] Project Sidebar aparece en rutas de proyecto
- [x] Transiciones son suaves y sin parpadeos
- [x] Items activos se destacan correctamente
- [x] Breadcrumbs son precisos
- [x] User menu funciona
- [x] Logout funciona
- [x] Todo está en español
- [x] No hay errores en consola
- [x] TypeScript compila sin errores

---

## 🎨 Verificación de Estilos

### Global Sidebar
- Fondo: `bg-slate-900`
- Items normales: `text-slate-300`
- Items activos: `bg-slate-800 text-white`
- Hover: `hover:bg-slate-800 hover:text-white`
- Ancho: `w-64` (256px)

### Project Sidebar
- Mismos estilos que Global
- Botón "Volver": `text-slate-300 hover:text-white`
- Nombre proyecto: `text-lg font-semibold text-white`
- Sub-items: `text-slate-400` → `text-white` (active)

### Header
- Fondo: `bg-white`
- Altura: `h-14`
- Border bottom: `border-b`

### Breadcrumbs
- Container: `bg-white border-b px-6 py-3`
- Links: `text-slate-600 hover:text-slate-900`
- Activo: `font-medium text-slate-900`

---

## 📸 Capturas de Referencia

### Global Context
```
┌─────────────────────────────────────────────────┐
│ [Logo]                      Org Name │ 🔔 │ U │
├─────────────┬───────────────────────────────────┤
│ Dashboard   │ Home / Proyectos                  │
│ ► Proyectos │───────────────────────────────────│
│ Equipo      │                                   │
│ Inventario  │   [Contenido de la página]        │
│ Proveedores │                                   │
│ Documentos  │                                   │
│ Config      │                                   │
└─────────────┴───────────────────────────────────┘
```

### Project Context
```
┌─────────────────────────────────────────────────┐
│ [Logo]                      Org Name │ 🔔 │ U │
├─────────────┬───────────────────────────────────┤
│ ← Volver    │ Home / Proyectos / Alpha / Budget │
│ Proyecto A  │───────────────────────────────────│
│ Dashboard   │                                   │
│ ► Presupuesto                                  │
│ Cronograma  │   [Presupuesto del proyecto]      │
│ Finanzas ▼  │                                   │
│  Transacc.  │                                   │
│  Certif.    │                                   │
│ Calidad     │                                   │
└─────────────┴───────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Problema: Sidebar no cambia
**Causa**: Lógica de detección en `DynamicSidebar`
**Fix**: Verificar regex en línea de detección

### Problema: Nombre de proyecto no aparece
**Causa**: API endpoint no responde
**Fix**: Verificar `/api/projects/[id]` y permisos

### Problema: Sección no auto-expande
**Causa**: useEffect en `ProjectSidebar`
**Fix**: Verificar que pathname match funciona

### Problema: Breadcrumbs incorrectos
**Causa**: Traducción faltante
**Fix**: Agregar en `SEGMENT_LABELS` en `dynamic-breadcrumbs.tsx`

---

## 📊 Métricas de Performance

```bash
# Build production
pnpm build

# Verificar bundle size
# Sidebar components deben ser pequeños (<5KB cada uno)
```

---

## ✨ Features Opcionales (Futuras)

- [ ] Sidebar colapsable (icono hamburger)
- [ ] Mobile menu (drawer)
- [ ] Búsqueda global en sidebar
- [ ] Keyboard shortcuts (Cmd+K)
- [ ] Sidebar persistence (localStorage)
- [ ] Tooltips en items colapsados
- [ ] Animaciones de transición
- [ ] Dark mode para sidebar
- [ ] Sticky breadcrumbs en scroll

---

**Última actualización**: 2025-02-01
**Versión**: 1.0.0
**Estado**: ✅ Implementación completa

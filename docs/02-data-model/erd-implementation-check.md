# Verificación ERD vs implementación (Prisma)

**Fecha:** 2025-02-05  
**Schema:** `packages/database/prisma/schema.prisma`  
**ERD:** `erd-complete.mmd` (51+ tablas base)

## Resumen

- **Entidades y relaciones del ERD base** están respetadas en el schema Prisma (nombres, FKs, cardinalidades).
- **Extensiones** (Super Admin, suscripciones, métricas de uso) se añadieron al schema sin romper el ERD; son adiciones documentadas.

## Core: tenancy y seguridad

| ERD | Schema Prisma | Estado |
|-----|----------------|--------|
| Organization (id, name, slug, tax_id, country, city, address, active, created_at, updated_at) | Igual + campos Super Admin (subscription_status, plan, límites, is_blocked, etc.) | OK (extensiones) |
| OrgProfile | Coincide (incl. base_currency, default_tax_pct, logo_storage_key) | OK |
| User (id, email UK, username UK, full_name, password_hash, avatar_url, active, created_at, updated_at, last_login_at) | Igual + is_super_admin, reset_token, reset_token_expires | OK (extensiones) |
| OrgMember (org_id, user_id, role, active, created_at, updated_at) | Igual + custom_permissions (JSON) | OK |
| Session, ModuleActivation, ApiKey, RefreshToken, IdempotencyKey, AuditLog | Coinciden en campos y relaciones | OK |

## Extensiones no documentadas en el ERD

Añadidas para el **portal Super Admin** y **SaaS**:

1. **User.is_super_admin** (boolean): identifica usuarios super admin (login sin org).
2. **Organization**: subscription_status, subscription_plan, fechas de suscripción, max_projects, max_users, max_storage_gb, is_blocked, blocked_reason/at/by, enabled_modules.
3. **SuperAdminLog**: tabla nueva para auditoría de acciones del super admin (acción, target_type, target_id, details, ip_address).
4. **OrgUsageMetrics**: tabla nueva para métricas de uso por org/mes (active_users, projects_created, storage_used_mb, api_calls, module_usage).
5. **Organization.usageMetrics**: relación 1–N con OrgUsageMetrics.

El ERD original no incluye estas tablas/campos; son coherentes con el modelo (solo ampliación).

## Relaciones

Las relaciones del ERD (Organization ↔ OrgProfile, Organization ↔ OrgMember, User ↔ OrgMember, Project ↔ WbsNode, etc.) se mantienen en el schema. No se eliminaron ni se cambiaron cardinalidades de las entidades base.

## Conclusión

La implementación **respeta el ERD** para todas las entidades y relaciones definidas en `erd-complete.mmd`. Las adiciones (Super Admin, suscripciones, métricas) extienden el modelo sin contradecirlo.

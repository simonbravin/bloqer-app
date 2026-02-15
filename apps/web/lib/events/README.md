# Sistema de Eventos (Message Bus + Outbox)

Sistema de eventos asíncronos basado en el patrón **Outbox**: las mutaciones escriben en la tabla `OutboxEvent` dentro de la misma transacción de Prisma, y **Inngest** (cron) consume esos eventos y los procesa.

---

## Cómo añadir un nuevo evento

### 1. Añadir el tipo al Hook (cliente)

En **`hooks/use-message-bus.ts`**, agrega el nuevo tipo a `MessageBusEventType`:

```ts
export type MessageBusEventType =
  | 'PROJECT.CREATED'
  | 'PROJECT.UPDATED'
  | 'MY_ENTITY.UPDATED'  // ← nuevo
```

Así los componentes podrán suscribirse con `useMessageBus('MY_ENTITY.UPDATED', callback)`.

---

### 2. Usar `publishOutboxEvent` en la Server Action

En la Server Action que hace la mutación (crear/editar/eliminar):

1. Importa el publisher:
   ```ts
   import { publishOutboxEvent } from '@/lib/events/event-publisher'
   ```

2. Ejecuta la mutación dentro de una **transacción** de Prisma (`prisma.$transaction`).

3. Dentro del mismo `tx`, después de la mutación, llama a:
   ```ts
   await publishOutboxEvent(tx, {
     orgId: org.orgId,
     eventType: 'MY_ENTITY.UPDATED',
     entityType: 'MyEntity',
     entityId: entity.id,
     payload: { name: entity.name, ... },
   })
   ```

**Importante:** `publishOutboxEvent` **debe** recibir el `tx` de la transacción. Así el evento solo se persiste si la mutación hace commit. Los nombres de campos en BD son los del `schema.prisma` (`event_type`, `org_id`, `payload`, etc.); el cliente de Prisma usa `eventType`, `orgId`, etc.

Si el payload incluye números financieros que vienen de Prisma, usa `Number(decimal)` o el tipo que corresponda antes de meterlos en el payload (evitar pasar `Prisma.Decimal` en el JSON si el consumidor espera número).

---

### 3. Cómo lo procesa Inngest

- **Función:** `inngest/functions/event-dispatcher.ts`
- **Trigger:** Cron cada 30 segundos (`*/30 * * * * *`).
- **Flujo:**
  1. Busca hasta 50 `OutboxEvent` con `status: 'PENDING'` (orden por `createdAt`).
  2. Por cada evento: marca `status: 'PROCESSING'`, hace `console.log` del payload (auditoría) y luego marca `status: 'COMPLETED'` y setea `processedAt`.
  3. Si en algún paso falla: incrementa `retryCount`, guarda el mensaje en `errorMessage` y devuelve el evento a `status: 'PENDING'` para el siguiente ciclo.

En el futuro puedes extender esta función para enviar notificaciones al cliente (SSE/WebSockets) o llamar a webhooks; el hook `useMessageBus` en el cliente está preparado para recibir esos avisos.

---

## Probar Inngest en local

En una **terminal aparte** (además del `pnpm dev` de Next.js):

```bash
npx inngest-cli@latest dev
```

Esto levanta el Inngest Dev Server (por defecto en `http://localhost:8288`). Las funciones registradas en `app/api/inngest/route.ts` se ejecutarán según el cron; puedes ver ejecuciones y logs en ese servidor.

---

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `lib/events/event-publisher.ts` | Escribe en `OutboxEvent` dentro de un `tx` de Prisma. |
| `lib/events/README.md` | Esta guía. |
| `inngest/client.ts` | Cliente Inngest (id: `bloqer`). |
| `inngest/functions/event-dispatcher.ts` | Cron que consume PENDING → PROCESSING → COMPLETED. |
| `app/api/inngest/route.ts` | Handler `serve()` que expone las funciones a Inngest. |
| `hooks/use-message-bus.ts` | Hook y `emitMessageBusEvent` para suscripciones y pruebas en el cliente. |

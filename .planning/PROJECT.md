# Facturai

## What This Is

Plataforma SaaS que automatiza la extracción y estructuración de datos de facturas de compra (foto, PDF) para PYMEs uruguayas. Permite a contadores y administradores subir facturas, extraer automáticamente los datos fiscales relevantes mediante IA (GPT-4o Vision), y exportar los datos en formatos compatibles con sistemas contables como Memory Conty.

Está construida con Next.js 16, PostgreSQL (Prisma), NextAuth.js y la API de OpenAI.

## Core Value

El contador puede subir una factura y obtener sus datos estructurados (RUT, IVA, totales) sin tipeo manual — en segundos.

## Requirements

### Validated

<!-- Ya implementado y funcionando en el codebase actual -->

- ✓ Autenticación con email/password (NextAuth + bcrypt) — existente
- ✓ Multi-tenant: cada empresa ve solo sus facturas (`companyId` isolation) — existente
- ✓ Subida de facturas (foto / PDF) via formulario — existente
- ✓ Extracción automática con GPT-4o Vision: RUT proveedor, fecha, número de factura, IVA, total, líneas de detalle — existente
- ✓ Clasificación IVA uruguaya (BASICA 22%, MÍNIMA 10%, EXONERADO 0%, EXPORTACIÓN 0%) — existente
- ✓ Validación y normalización de RUT uruguayo — existente
- ✓ Gestión de proveedores (lookup por RUT + company) — existente
- ✓ Dashboard con estadísticas de facturas por estado — existente
- ✓ Flujo de aprobación de facturas (PROCESSING → EXTRACTED → APPROVED) — existente

### Active

<!-- Pendiente de implementar para completar el MVP -->

- [ ] Exportación a CSV con datos de facturas extraídas
- [ ] Fix seguridad: autorización en endpoint PATCH `/api/invoices/[id]` (verificar `companyId` antes de actualizar)
- [ ] Fix seguridad: validación server-side de tipo de archivo en upload (no solo client-side)
- [ ] Fix seguridad: validar RUT de empresa en registro usando `validateRut()`
- [ ] Registro de usuario y empresa (flujo completo y validado)

### Out of Scope

- Soporte XML / facturas electrónicas DGI — alto parsing específico, difiere para v2
- Async job queue (Bull/SQS) para extracción en background — v2 cuando escale
- Migración a S3/cloud storage — v2, base64 en DB es suficiente para MVP
- OAuth (Google, GitHub) — email/password suficiente para v1
- App móvil nativa — web-first
- Integración directa con Memory Conty API — CSV manual es suficiente para v1
- Rate limiting por empresa — v2

## Context

- Stack: Next.js 16 (App Router) + React 19 + TypeScript + Prisma + PostgreSQL + NextAuth + OpenAI SDK 6.x
- Tailwind CSS 4 + shadcn/ui + Recharts para el dashboard
- Almacenamiento de archivos: base64 en campo `Invoice.fileUrl` (MVP approach, escala a S3 en v2)
- Clasificación IVA con estrategia en cascada: indicador de IA → reglas en BD → default BASICA
- Generado client de Prisma en `src/generated/prisma/` (no committear cambios manualmente)
- Repositorio activo en Git con 3 commits previos al inicio de GSD
- `.env.example` expone patrones peligrosos de credenciales — documentar corrección

## Constraints

- **Stack**: Next.js + PostgreSQL + OpenAI — no cambiar stack central del MVP
- **Mercado**: PYMEs uruguayas — RUT formato 12 dígitos sin separadores, IVA según DGI Uruguay
- **Extracción**: Depende de OpenAI GPT-4o Vision — calidad de extracción atada a calidad de imagen/PDF
- **Seguridad**: SaaS con datos financieros — fixes de autorización son bloqueantes antes de producción

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| GPT-4o Vision para extracción | Elimina parser específico por proveedor, maneja facturas heterogéneas | — Pending |
| Base64 en DB para archivos | Simplifica MVP, evita configurar S3 | — Pending |
| Clasificación IVA rule-based + fallback | Permite personalización por empresa sin re-entrenar modelo | — Pending |
| NextAuth credentials provider | Suficiente para v1 sin complejidad de OAuth | — Pending |
| Prisma con PostgreSQL | Tipado fuerte, migraciones, multi-tenant natural con `companyId` | ✓ Good |

---
*Last updated: 2026-02-26 after initialization*

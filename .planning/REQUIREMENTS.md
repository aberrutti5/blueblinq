# Requirements: Facturai

**Defined:** 2026-02-26
**Core Value:** El contador puede subir una factura y obtener sus datos estructurados (RUT, IVA, totales) sin tipeo manual — en segundos.

## v1 Requirements

### Authentication

- [x] **AUTH-01**: Usuario puede registrarse con email, password y RUT de empresa
- [x] **AUTH-02**: Usuario puede iniciar sesión y mantenerse logueado entre sesiones
- [x] **AUTH-03**: Cada empresa ve únicamente sus propias facturas (aislamiento multi-tenant por `companyId`)

### Upload & Extraction

- [x] **UPLOAD-01**: Usuario puede subir facturas en formato foto (JPG/PNG) o PDF
- [x] **EXTRACT-01**: Sistema extrae automáticamente RUT proveedor, fecha, número de factura, IVA y total via GPT-4o Vision
- [x] **EXTRACT-02**: Sistema clasifica IVA de cada línea según tasas DGI Uruguay (BASICA 22%, MÍNIMA 10%, EXONERADO 0%, EXPORTACIÓN 0%)
- [x] **EXTRACT-03**: RUT del proveedor es validado y normalizado (12 dígitos, sin separadores) antes de persistir

### Dashboard & Review

- [x] **DASH-01**: Usuario ve dashboard con estadísticas de facturas agrupadas por estado (PROCESSING, EXTRACTED, APPROVED, ERROR)
- [x] **REVIEW-01**: Usuario puede revisar los datos extraídos y aprobar facturas

### Export

- [ ] **EXPORT-01**: Usuario puede exportar datos de facturas extraídas a CSV compatible con sistemas contables (ej. Memory Conty)

### Security

- [ ] **SEC-01**: Endpoint PATCH `/api/invoices/[id]` valida que la factura pertenece a la empresa del usuario antes de permitir modificaciones
- [x] **SEC-02**: Validación de tipo de archivo se realiza en el servidor (no solo en el cliente) antes de enviar a OpenAI
- [ ] **SEC-03**: RUT de empresa es validado con checksum al momento del registro

## v2 Requirements

### Integrations

- **INT-01**: Soporte de facturas electrónicas XML (DGI Uruguay) — parser específico
- **INT-02**: Integración directa con API de Memory Conty

### Infrastructure

- **INFRA-01**: Migración de almacenamiento de archivos a cloud storage (S3/R2)
- **INFRA-02**: Job queue asíncrono para extracción en background (evitar timeouts)
- **INFRA-03**: Rate limiting por empresa (cuotas de uploads/hora, gasto de OpenAI)

### Auth

- **AUTH-04**: Login con OAuth (Google) como alternativa a email/password

## Out of Scope

| Feature | Reason |
|---|---|
| App móvil nativa | Web-first; mobile posterior |
| Soporte multi-idioma | Solo español (Uruguay) en v1 |
| Contabilidad completa | Solo extracción y exportación, no reemplaza sistema contable |
| IA propietaria | Depende de OpenAI GPT-4o en v1; modelo propio es v3+ |

## Traceability

| Requirement | Phase | Status |
|---|---|---|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| UPLOAD-01 | Phase 1 | Complete |
| EXTRACT-01 | Phase 1 | Complete |
| EXTRACT-02 | Phase 1 | Complete |
| EXTRACT-03 | Phase 1 | Complete |
| DASH-01 | Phase 1 | Complete |
| REVIEW-01 | Phase 1 | Complete |
| EXPORT-01 | Phase 2 | Pending |
| SEC-01 | Phase 2 | Pending |
| SEC-02 | Phase 2 | Complete |
| SEC-03 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-26*
*Last updated: 2026-02-26 after initial definition*

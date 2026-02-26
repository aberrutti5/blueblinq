---
phase: 02-export-security
plan: 01
subsystem: api
tags: [csv, export, nextjs, prisma, tenant-isolation]

# Dependency graph
requires:
  - phase: 01-core-platform
    provides: Invoice model, companyId tenant pattern, NextAuth session, invoices list page
provides:
  - GET /api/invoices/export endpoint returning CSV file attachment with tenant isolation
  - Exportar CSV button in invoices list page header
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Use native Response (not NextResponse) for file download endpoints to ensure correct header handling"
    - "CSV escaping: wrap fields containing commas/quotes/newlines in double-quotes, escape internal double-quotes by doubling"
    - "Anchor tag with download attribute for triggering browser file download without fetch+blob pattern"

key-files:
  created:
    - src/app/api/invoices/export/route.ts
  modified:
    - src/app/(dashboard)/invoices/page.tsx

key-decisions:
  - "Use native Response instead of NextResponse for CSV endpoint — ensures Content-Disposition header is set correctly for file download"
  - "Anchor tag with download attribute over fetch+blob URL — simpler, no client-side JS required, works with session cookie auth"
  - "CRLF line endings (\\r\\n) for CSV rows — RFC 4180 compliant"

patterns-established:
  - "Pattern: CSV file download endpoint uses native Response with Content-Type text/csv and Content-Disposition attachment header"
  - "Pattern: Tenant isolation via companyId from default CompanyMembership — same as /api/invoices GET"

requirements-completed: [EXPORT-01]

# Metrics
duration: 2min
completed: 2026-02-26
---

# Phase 2 Plan 01: CSV Export for Invoices Summary

**GET /api/invoices/export endpoint with tenant isolation returning RFC 4180 CSV, plus Exportar CSV button in the invoices list page header**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-26T22:39:35Z
- **Completed:** 2026-02-26T22:41:55Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- New GET /api/invoices/export endpoint returning CSV with 10-column header (Numero, Fecha, Proveedor, RUT Proveedor, Tipo, Subtotal, IVA, Total, Moneda, Estado)
- Tenant isolation: invoices filtered by companyId from authenticated user's default membership
- Unauthenticated requests return 401; missing company returns 400
- Exportar CSV button added to invoices list page header using outline variant, alongside existing Subir factura button

## Task Commits

Each task was committed atomically:

1. **Task 1: Create GET /api/invoices/export endpoint** - `b62f565` (feat)
2. **Task 2: Add export button to invoices list page** - `fc8ed15` (feat)

## Files Created/Modified
- `src/app/api/invoices/export/route.ts` - CSV export endpoint with auth guard, tenant isolation, and CSV builder
- `src/app/(dashboard)/invoices/page.tsx` - Added Download icon import and Exportar CSV button in page header

## Decisions Made
- Used native `Response` (not `NextResponse`) for the CSV endpoint — `NextResponse` can interfere with binary/file response headers in Next.js App Router
- Used `<a href="/api/invoices/export" download>` pattern instead of fetch+blob — simpler, no client-side JS required, works naturally with browser's session cookie for auth
- CRLF line endings (`\r\n`) for CSV body — RFC 4180 standard for CSV files

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- EXPORT-01 requirement fulfilled; CSV export is production-ready for authenticated users
- Remaining Phase 2 work: SEC-01 (multi-tenancy audit) and SEC-02 (file upload security) — both production blockers noted in STATE.md

## Self-Check: PASSED

- FOUND: src/app/api/invoices/export/route.ts
- FOUND: src/app/(dashboard)/invoices/page.tsx
- FOUND: .planning/phases/02-export-security/02-01-SUMMARY.md
- FOUND: commit b62f565 (feat: create export endpoint)
- FOUND: commit fc8ed15 (feat: add export button)

---
*Phase: 02-export-security*
*Completed: 2026-02-26*

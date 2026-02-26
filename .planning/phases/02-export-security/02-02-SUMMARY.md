---
phase: 02-export-security
plan: 02
subsystem: api
tags: [authorization, multi-tenancy, rut-validation, next-auth, prisma]

# Dependency graph
requires:
  - phase: 01-core-platform
    provides: db schema with companyId on invoices, companyMembership table, validateRut utility
provides:
  - PATCH /api/invoices/[id] with companyId ownership check (403 on cross-company access)
  - GET /api/invoices/[id] with companyId ownership check (403 on cross-company access)
  - POST /api/register validates RUT checksum before creating company
affects:
  - Any future invoice modification endpoints
  - Any future company registration flows

# Tech tracking
tech-stack:
  added: []
  patterns:
    - getUserCompanyId() helper — fetch user's default company, used before any invoice operation
    - Ownership gate pattern — findUnique before update, compare companyId, return 403 or 404
    - validateRut before DB write — reject invalid checksum, store normalized clean form

key-files:
  created: []
  modified:
    - src/app/api/invoices/[id]/route.ts
    - src/app/api/register/route.ts

key-decisions:
  - "Return 403 (not 404) when invoice exists but belongs to another company — avoids leaking existence info while being explicit to authenticated users"
  - "Store rutValidation.clean not raw input — ensures normalized 12-digit form in DB regardless of user formatting"
  - "Apply ownership check to GET handler as well (plan specified this as an additional fix) — consistent security across read and write"

patterns-established:
  - "Ownership gate: fetch invoice first (select companyId only), compare to user's companyId, return 403 if mismatch — applied to both GET and PATCH"
  - "getUserCompanyId() extracted as helper — DRY pattern for all invoice endpoints needing company context"

requirements-completed: [SEC-01, SEC-03]

# Metrics
duration: 3min
completed: 2026-02-26
---

# Phase 2 Plan 02: Security Fixes — Ownership Check and RUT Validation Summary

**Multi-tenancy ownership gate on invoice GET/PATCH and RUT checksum validation on registration, closing two production-blocking security vulnerabilities**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-26T22:39:38Z
- **Completed:** 2026-02-26T22:42:35Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- PATCH /api/invoices/[id] now fetches invoice before update, compares companyId, returns 403 for cross-company access and 404 for non-existent invoices
- GET /api/invoices/[id] now also enforces ownership check — closes read-side of the same multi-tenancy gap
- POST /api/register now validates RUT checksum via validateRut() before creating company, returns 400 for invalid checksums
- Company RUT stored in normalized clean form from validateRut().clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ownership check to PATCH /api/invoices/[id]** - `3fb1add` (fix)
2. **Task 2: Add RUT checksum validation to registration endpoint** - `ab26a47` (fix)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/app/api/invoices/[id]/route.ts` - Added getUserCompanyId() helper; GET and PATCH both enforce companyId ownership before returning/modifying data
- `src/app/api/register/route.ts` - Added validateRut() import and call after Zod parse; company creation uses rutValidation.clean

## Decisions Made
- Returned 403 (not 404) when invoice exists but belongs to another company — avoids leaking invoice existence while still being explicit to authenticated callers
- Applied ownership check to GET handler in addition to PATCH (plan specified this as an additional fix) — consistent security posture across read and write
- Store rutValidation.clean not raw companyRut input — ensures 12-digit normalized form in DB regardless of how user formatted input

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- SEC-01 (multi-tenancy authorization gap on invoice PATCH) resolved
- SEC-03 (RUT validation gap on registration) resolved
- Both production-blocking security vulnerabilities from Phase 2 requirements closed
- SEC-02 (file upload MIME type validation) was addressed in plan 02-03

## Self-Check: PASSED

- FOUND: src/app/api/invoices/[id]/route.ts
- FOUND: src/app/api/register/route.ts
- FOUND: .planning/phases/02-export-security/02-02-SUMMARY.md
- FOUND: commit 3fb1add (Task 1)
- FOUND: commit ab26a47 (Task 2)

---
*Phase: 02-export-security*
*Completed: 2026-02-26*

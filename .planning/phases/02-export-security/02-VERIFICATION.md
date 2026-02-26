---
phase: 02-export-security
verified: 2026-02-26T23:00:00Z
status: passed
score: 13/13 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Click 'Exportar CSV' button on /invoices while logged in"
    expected: "Browser prompts file download of facturas.csv; file opens in spreadsheet with correct column headers and one row per invoice"
    why_human: "Browser file download behavior and CSV content correctness cannot be verified without a live session and real invoice data"
  - test: "Attempt to register with a RUT that has a wrong check digit (e.g., submit one digit off)"
    expected: "Server returns 400 with 'RUT de empresa inválido'; user cannot complete registration"
    why_human: "Checksum algorithm correctness under realistic inputs requires end-to-end form submission with known valid/invalid RUTs"
  - test: "Upload a non-image file (rename a .exe or .html to .jpg, use curl to send with wrong MIME type)"
    expected: "Server returns 400 with 'Tipo de archivo no permitido'; no OpenAI API call is made"
    why_human: "Confirming that no OpenAI call occurs for rejected files requires network inspection or log tracing in a running environment"
---

# Phase 2: Export Security Verification Report

**Phase Goal:** Accountants can export their approved invoice data and the platform is safe for production with real financial data
**Verified:** 2026-02-26T23:00:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can click an 'Exportar CSV' button on the invoices page | VERIFIED | `page.tsx` line 67-72: `<a href="/api/invoices/export" download><Button variant="outline">...Exportar CSV</Button></a>` |
| 2 | Clicking the button triggers a file download of a .csv file | VERIFIED | `<a download>` attribute present; endpoint returns `Content-Disposition: attachment; filename="facturas.csv"` (export/route.ts line 79) |
| 3 | CSV contains one row per invoice with 10 required columns | VERIFIED | Header row at export/route.ts line 55: `Numero,Fecha,Proveedor,RUT Proveedor,Tipo,Subtotal,IVA,Total,Moneda,Estado`; rows built with all 10 fields (lines 57-72) |
| 4 | Only invoices belonging to the authenticated user's company are exported | VERIFIED | export/route.ts line 39: `where: { companyId }` — companyId fetched from user's default membership (lines 5-11, 30-36) |
| 5 | Requesting the export endpoint without a session returns 401 | VERIFIED | export/route.ts lines 21-27: session check returns status 401 JSON when `!session?.user` |
| 6 | A user from Company A cannot modify an invoice belonging to Company B by guessing its ID | VERIFIED | `[id]/route.ts` PATCH handler: fetches invoice first (line 77-80), compares `existing.companyId !== companyId` (line 89), returns 403 |
| 7 | PATCH /api/invoices/[id] returns 403 when companyId mismatch | VERIFIED | `[id]/route.ts` line 89-91: `if (existing.companyId !== companyId) return NextResponse.json({ error: "No autorizado" }, { status: 403 })` |
| 8 | PATCH /api/invoices/[id] returns 404 when invoice does not exist | VERIFIED | `[id]/route.ts` lines 82-87: `if (!existing) return ... { status: 404 }` |
| 9 | Registering a company with an invalid RUT (wrong checksum) is rejected with 400 | VERIFIED | `register/route.ts` lines 20-26: `validateRut()` called after Zod parse; returns 400 `"RUT de empresa inválido"` if `!rutValidation.valid` |
| 10 | Registering a company with a valid RUT succeeds and stores normalized form | VERIFIED | `register/route.ts` line 52: `rut: rutValidation.clean` — normalized 12-digit form stored |
| 11 | Uploading a .exe or .html file is rejected server-side with 400 before reaching OpenAI | VERIFIED | `invoices/route.ts` line 83: `ALLOWED_TYPES.includes(file.type ...)` check at line 83, before `file.arrayBuffer()` at line 91 and `extractInvoiceFromBase64` at line 111 |
| 12 | Uploading a valid JPG, PNG, WebP, or PDF is accepted and processed normally | VERIFIED | ALLOWED_TYPES const (lines 9-14) lists all four; non-matching types return 400, matching types fall through to existing processing logic |
| 13 | File type is validated using file.type on the server, not only client-side | VERIFIED | `ALLOWED_TYPES` const defined at module level (line 9); check in POST handler at line 83 uses `file.type` from multipart form data |

**Score:** 13/13 truths verified

---

### Required Artifacts

| Artifact | Provides | Exists | Substantive | Wired | Status |
|----------|----------|--------|-------------|-------|--------|
| `src/app/api/invoices/export/route.ts` | GET endpoint streaming CSV with auth guard, tenant isolation, Content-Disposition header | Yes | Yes (83 lines, full implementation) | Linked via `<a href>` in page.tsx | VERIFIED |
| `src/app/(dashboard)/invoices/page.tsx` | Invoices list page with Exportar CSV button | Yes | Yes (171 lines, full page) | Renders in dashboard layout | VERIFIED |
| `src/app/api/invoices/[id]/route.ts` | GET + PATCH handlers with companyId ownership check | Yes | Yes (101 lines, both handlers patched) | Called by invoice detail page | VERIFIED |
| `src/app/api/register/route.ts` | POST handler with RUT checksum validation before company creation | Yes | Yes (82 lines, full implementation) | Called by registration form | VERIFIED |
| `src/app/api/invoices/route.ts` | POST handler with server-side MIME type allowlist | Yes | Yes (232 lines, ALLOWED_TYPES at module level) | Called by invoice upload form | VERIFIED |
| `src/lib/tax/rut-validator.ts` | Modulo-11 RUT checksum validation utility | Yes | Yes (29 lines, algorithm implemented) | Imported by register/route.ts and invoices/route.ts | VERIFIED |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `invoices/page.tsx` | `/api/invoices/export` | `<a href="/api/invoices/export" download>` | WIRED | Line 67 in page.tsx; `download` attribute triggers browser file save |
| `export/route.ts` | `db.invoice.findMany` | Prisma query filtered by `companyId` | WIRED | Lines 38-53: `db.invoice.findMany({ where: { companyId }, ... })` |
| `[id]/route.ts PATCH` | `db.invoice.findUnique` | Ownership check: fetch invoice, compare `invoice.companyId` to user's | WIRED | Lines 77-91: findUnique then `existing.companyId !== companyId` guard |
| `register/route.ts` | `src/lib/tax/rut-validator.ts` | `import { validateRut }` called after Zod parse | WIRED | Line 5 import; line 20 call; line 52 uses `rutValidation.clean` |
| `invoices/route.ts POST` | `extractInvoiceFromBase64` | MIME type check runs BEFORE base64 conversion and AI call | WIRED | ALLOWED_TYPES check at line 83; `file.arrayBuffer()` at line 91; `extractInvoiceFromBase64` at line 111 — correct ordering confirmed |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| EXPORT-01 | 02-01 | User can export invoice data to CSV compatible with accounting systems | SATISFIED | GET /api/invoices/export returns RFC 4180 CSV with 10-column header; button in invoices page triggers download |
| SEC-01 | 02-02 | PATCH /api/invoices/[id] validates invoice belongs to user's company before allowing modifications | SATISFIED | `[id]/route.ts` PATCH handler: findUnique then companyId comparison, returns 403 on mismatch, 404 if not found |
| SEC-02 | 02-03 | File type validation performed on server before sending to OpenAI | SATISFIED | ALLOWED_TYPES at module level; guard at line 83 before `file.arrayBuffer()` at line 91 and AI call at line 111 |
| SEC-03 | 02-02 | Company RUT validated with checksum at registration | SATISFIED | `register/route.ts` calls `validateRut()` after Zod parse; rejects with 400 for invalid checksum; stores `rutValidation.clean` |

No orphaned requirements: REQUIREMENTS.md maps exactly EXPORT-01, SEC-01, SEC-02, SEC-03 to Phase 2. All four are claimed by plans and verified in code.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/api/invoices/route.ts` | 94 | `// MVP - in production use S3/Blob` comment on base64 file storage | Info | Known limitation, documented in REQUIREMENTS.md as INFRA-01 (v2 backlog); does not block Phase 2 goal |

No blocker or warning anti-patterns found in Phase 2 files. The base64 storage comment is pre-existing from Phase 1 and explicitly scoped to v2.

---

### Bonus: GET /api/invoices/[id] Ownership Check

Plan 02-02 specified adding ownership check to both GET and PATCH handlers on `/api/invoices/[id]`. The implementation applies it to both:
- GET handler: lines 34-51 — findUnique includes lineItems/vendor, checks `invoice.companyId !== companyId`, returns 403
- PATCH handler: lines 77-91 — lightweight findUnique (companyId only), checks ownership, then performs update

This exceeds the minimum SEC-01 requirement (PATCH only) and closes the read-side gap as well.

---

### Human Verification Required

#### 1. CSV File Download — Browser Behavior

**Test:** Log in as an accountant user, navigate to /invoices, click "Exportar CSV"
**Expected:** Browser downloads a file named `facturas.csv`; opening it in a spreadsheet shows columns `Numero,Fecha,Proveedor,RUT Proveedor,Tipo,Subtotal,IVA,Total,Moneda,Estado` and one data row per invoice
**Why human:** Browser download behavior, file naming, and CSV column alignment require a live authenticated session with real data

#### 2. RUT Checksum Rejection — Registration Form

**Test:** Fill in the registration form with a RUT that has an incorrect check digit (e.g., flip the last digit of a known-valid RUT). Submit the form.
**Expected:** Registration fails with "RUT de empresa inválido"; no user or company is created in the database
**Why human:** End-to-end validation path through the form, network layer, and Zod parse needs live testing with known valid/invalid RUT pairs

#### 3. Server-Side MIME Rejection — File Upload

**Test:** Use curl or a modified form submission to upload a file with `Content-Type: application/octet-stream` (or `text/html`) to POST /api/invoices
**Expected:** Server responds 400 with "Tipo de archivo no permitido"; no OpenAI API call occurs (confirm via logs or API usage dashboard)
**Why human:** Confirming the OpenAI call is absent for rejected files requires network inspection or log tracing in a running environment

---

### Gaps Summary

No gaps. All 13 observable truths are verified by direct code inspection. All key links are confirmed wired. All four requirement IDs (EXPORT-01, SEC-01, SEC-02, SEC-03) are satisfied with implementation evidence. TypeScript compiles without errors (`npx tsc --noEmit` exits 0). All five documented git commits exist in the repository history.

---

_Verified: 2026-02-26T23:00:00Z_
_Verifier: Claude (gsd-verifier)_

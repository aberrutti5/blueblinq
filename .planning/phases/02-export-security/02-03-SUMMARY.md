---
phase: 02-export-security
plan: "03"
subsystem: api-security
tags: [security, file-validation, mime-type, api]
dependency_graph:
  requires: []
  provides: [server-side-mime-validation]
  affects: [src/app/api/invoices/route.ts]
tech_stack:
  added: []
  patterns: [allowlist-validation, early-return]
key_files:
  created: []
  modified:
    - src/app/api/invoices/route.ts
decisions:
  - "Module-level ALLOWED_TYPES const — avoids recreating on every request and is easy to extend"
  - "Validate file.type (server-reported MIME from multipart Content-Type) before any file processing"
  - "Return 400 (not 422) consistent with existing error patterns in the handler"
metrics:
  duration: "~2 minutes"
  completed: "2026-02-26"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
---

# Phase 2 Plan 3: Server-Side MIME Type Validation Summary

**One-liner:** MIME type allowlist (ALLOWED_TYPES) added at module level in POST /api/invoices — rejects non-image/non-PDF files with 400 before any OpenAI API call.

## What Was Built

Added server-side file type validation to the invoice upload endpoint. Previously, the POST handler trusted the client to send only valid file types; a malicious user could bypass the client-side check and send arbitrary files (e.g., `.exe`, `.html`) directly to the API, causing them to be forwarded to OpenAI.

The fix adds an `ALLOWED_TYPES` constant at module level and validates `file.type` against it immediately after the null check — before `file.arrayBuffer()`, before DB record creation, and before any call to `extractInvoiceFromBase64`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add server-side MIME type validation to POST /api/invoices | a8c49c3 | src/app/api/invoices/route.ts |

## Key Changes

**src/app/api/invoices/route.ts**

- Added `ALLOWED_TYPES` constant at module level (lines 9-14):
  ```typescript
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ] as const;
  ```

- Added validation guard after null check, before any file processing (lines 83-88):
  ```typescript
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido. Usá JPG, PNG, WebP o PDF." },
      { status: 400 }
    );
  }
  ```

## Verification Results

- `npx tsc --noEmit`: PASS (no TypeScript errors)
- `ALLOWED_TYPES` defined at module level (line 9) and used in guard (line 83)
- Validation at line 83 precedes `file.arrayBuffer()` at line 91
- 400 response for invalid types confirmed at line 86
- Allowed types: image/jpeg, image/png, image/webp, application/pdf — consistent with client-side validation in invoice-upload-form.tsx

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- File exists: src/app/api/invoices/route.ts — FOUND
- SUMMARY.md created at .planning/phases/02-export-security/02-03-SUMMARY.md — FOUND
- Commit a8c49c3 — FOUND

# Roadmap: Facturai

## Overview

The core invoice extraction platform is already built and validated. Phase 1 covers all implemented functionality — authentication, upload, AI extraction, IVA classification, dashboard, and review workflow. Phase 2 delivers the two remaining MVP capabilities: CSV export so accountants can get their data out, and the security fixes that make the platform safe to put in production with real financial data.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Core Platform** - Authentication, invoice upload + AI extraction, IVA classification, dashboard, and review workflow — fully implemented
- [ ] **Phase 2: Export & Security** - CSV export for accountants and security hardening before production launch

## Phase Details

### Phase 1: Core Platform
**Goal**: Accountants can upload invoices and obtain structured fiscal data without manual entry
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, UPLOAD-01, EXTRACT-01, EXTRACT-02, EXTRACT-03, DASH-01, REVIEW-01
**Success Criteria** (what must be TRUE):
  1. User can register with email, password, and company RUT and log in across sessions
  2. User can upload a JPG, PNG, or PDF invoice and receive extracted data (RUT, date, invoice number, IVA, total) without typing
  3. Each extracted line item shows its IVA category (BASICA 22%, MINIMA 10%, EXONERADO, EXPORTACION) correctly
  4. User sees a dashboard with invoice counts by status (PROCESSING, EXTRACTED, APPROVED, ERROR)
  5. User can review extracted data and approve an invoice to move it to APPROVED status
**Plans**: Complete

Plans:
- [x] 01-01: Authentication and multi-tenant setup
- [x] 01-02: Invoice upload and AI extraction pipeline
- [x] 01-03: IVA classification, vendor management, dashboard, review workflow

### Phase 2: Export & Security
**Goal**: Accountants can export their approved invoice data and the platform is safe for production with real financial data
**Depends on**: Phase 1
**Requirements**: EXPORT-01, SEC-01, SEC-02, SEC-03
**Success Criteria** (what must be TRUE):
  1. User can download a CSV file containing extracted invoice data in a format compatible with Memory Conty
  2. An authenticated user from Company A cannot modify or approve invoices belonging to Company B, even by guessing invoice IDs
  3. Uploading a non-image/non-PDF file (e.g., an .exe or .html) is rejected by the server before reaching OpenAI
  4. Registering a company with an invalid RUT (wrong checksum) is rejected at the registration step
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — CSV export endpoint and UI button (EXPORT-01)
- [ ] 02-02-PLAN.md — PATCH authorization check + RUT checksum validation at registration (SEC-01, SEC-03)
- [ ] 02-03-PLAN.md — Server-side file type validation on upload (SEC-02)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Platform | 3/3 | Complete | 2026-02-26 |
| 2. Export & Security | 0/3 | Not started | - |

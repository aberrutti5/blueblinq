# Architecture

**Analysis Date:** 2026-02-26

## Pattern Overview

**Overall:** Next.js 16 Full-Stack Application with Multi-Tenancy

**Key Characteristics:**
- Server-side rendering (SSR) with React 19
- API Routes for REST endpoints
- JWT-based session management via NextAuth
- Multi-tenant architecture with company membership model
- AI-powered invoice extraction pipeline
- Rule-based tax classification system

## Layers

**Presentation Layer:**
- Purpose: User interface components and pages
- Location: `src/app/`, `src/components/`
- Contains: Server and client components, page routes, UI components (shadcn/ui based)
- Depends on: Next.js, React, client-side hooks, API calls via fetch
- Used by: End users accessing web application

**API Routes / Backend Logic:**
- Purpose: HTTP endpoints for data operations and external integrations
- Location: `src/app/api/`
- Contains: NextAuth handlers, invoice upload/retrieval, file processing, AI extraction orchestration
- Depends on: NextAuth, Prisma DB, OpenAI API, utility functions in `src/lib/`
- Used by: Frontend, external services

**Business Logic / Utilities:**
- Purpose: Domain-specific functions (AI, tax, auth, validation)
- Location: `src/lib/` and `src/lib/ai/`, `src/lib/tax/`
- Contains: Invoice extraction, IVA classification, RUT validation, auth configuration
- Depends on: OpenAI SDK, Prisma client, Zod for validation
- Used by: API routes

**Data Access / ORM:**
- Purpose: Database abstraction and queries
- Location: `src/lib/db.ts`, Prisma schema at `prisma/schema.prisma`
- Contains: Prisma client initialization with PostgreSQL adapter, all data models
- Depends on: PostgreSQL via @prisma/adapter-pg
- Used by: All API routes and business logic

**Types / Contracts:**
- Purpose: Type definitions for data structures
- Location: `src/types/`, `src/generated/prisma/` (auto-generated)
- Contains: Invoice extraction schema, tax constants, Prisma-generated types
- Depends on: Zod for runtime validation schemas
- Used by: All TypeScript files

## Data Flow

**Invoice Upload & Processing:**

1. User uploads file via `src/app/(dashboard)/invoices/upload/page.tsx`
2. `InvoiceUploadForm` component validates file (size, type) and sends FormData to `/api/invoices`
3. `src/app/api/invoices/route.ts` POST handler:
   - Validates user session and retrieves company ID
   - Converts file to base64 and stores as data URL
   - Creates PROCESSING invoice record in database
   - Calls `extractInvoiceFromBase64()` from `src/lib/ai/extract-invoice.ts`
4. `extract-invoice.ts`:
   - Sends base64 image + system/user prompts to OpenAI Vision API (gpt-4o)
   - Receives structured JSON extraction
   - Validates response schema using `parseExtractionResponse()` from `parse-response.ts`
5. Back in POST handler, processes extracted line items:
   - For each line item, calls `classifyIva()` from `src/lib/tax/iva-classifier.ts`
   - Classification uses three strategies (in order):
     a. Parse IVA indicator text directly
     b. Match against company-specific and global keyword rules in database
     c. Default to BASICA (22% rate)
   - Calculates IVA amount using `calculateIvaAmount()`
6. Vendor matching via `src/lib/tax/rut-validator.ts`:
   - Validates and normalizes vendor RUT
   - Looks up existing vendor by (companyId, rut) composite key
   - Creates new vendor if needed
7. Stores complete invoice with line items in database
8. Returns updated invoice record to frontend
9. On error, marks invoice as ERROR status and returns error details

**User Authentication:**

1. User submits credentials on login page `src/app/(auth)/login/page.tsx`
2. Client calls `signIn("credentials", ...)` from next-auth/react
3. Routed to `/api/auth/[...nextauth]/route.ts` which delegates to `authOptions` in `src/lib/auth.ts`
4. `CredentialsProvider.authorize()`:
   - Finds user by email via Prisma
   - Compares password hash using bcryptjs (dynamic import to avoid client bundling)
   - Returns user object with id, email, name, image
5. NextAuth creates JWT token with user ID in payload
6. Session cookie stored client-side
7. Protected routes require session via `getServerSession(authOptions)`

**Dashboard Statistics:**

1. Client component loads on `src/app/(dashboard)/dashboard/page.tsx`
2. useEffect calls `/api/invoices?limit=1000`
3. API handler retrieves all invoices for user's default company, filters by status
4. Frontend renders stats cards showing counts by status (EXTRACTED, APPROVED, PROCESSING, ERROR)

**State Management:**

- Session state: Managed by NextAuth (JWT + SessionProvider)
- UI component state: React hooks (useState, useCallback, useEffect)
- Server state: Prisma database with Decimal.js for financial precision
- No external state management library (Redux, Zustand) used

## Key Abstractions

**Invoice Extraction Pipeline:**
- Purpose: Transform binary/image files → structured, validated data
- Examples: `src/lib/ai/extract-invoice.ts`, `src/lib/ai/parse-response.ts`, `src/lib/ai/prompts.ts`
- Pattern: Layered composition (file → OpenAI → validation → classification → persistence)

**IVA Classification Engine:**
- Purpose: Categorize line items with tax rates (BASICA 22%, MINIMA 10%, EXONERADO 0%, EXPORTACION 0%)
- Examples: `src/lib/tax/iva-classifier.ts`, `src/lib/tax/iva-categories.ts`
- Pattern: Strategy pattern with fallback (AI indicator → rule-based → default)

**Multi-Tenant Data Isolation:**
- Purpose: Ensure company data is segregated by `companyId`
- Examples: Company/CompanyMembership/Vendor models in schema
- Pattern: Composite keys (userId, companyId), default company selection

**RUT Validation & Normalization:**
- Purpose: Standardize Uruguayan tax ID format (12 digits, no separators)
- Examples: `src/lib/tax/rut-validator.ts`
- Pattern: Input validation with error details

## Entry Points

**Web Entry Point:**
- Location: `src/app/layout.tsx` (Root Layout)
- Triggers: Browser navigation to domain
- Responsibilities: Sets up global metadata, imports fonts, renders children

**Dashboard Entry Point:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: User navigates to `/dashboard` or any route under `(dashboard)` group
- Responsibilities: Wraps with SessionProvider, renders Sidebar + main content area

**API Entry Points:**
- Location: `src/app/api/invoices/route.ts` (main upload/list)
- Location: `src/app/api/invoices/[id]/route.ts` (detail/update)
- Location: `src/app/api/invoices/[id]/approve/route.ts` (approval workflow)
- Location: `src/app/api/auth/[...nextauth]/route.ts` (auth)
- Triggers: HTTP requests from frontend
- Responsibilities: Session validation, business logic orchestration, database transactions

**Database Initialization:**
- Location: `src/lib/db.ts`
- Triggers: Module import (lazy initialization on first use)
- Responsibilities: Creates singleton Prisma client with PostgreSQL adapter

## Error Handling

**Strategy:** Try-catch blocks with specific error states

**Patterns:**
- API routes: Return `NextResponse.json({ error: "message" }, { status: <code> })` on failure
- AI extraction: Marks invoice as ERROR status, stores raw error message in `extractionError` field
- Client forms: Set error state, display in red box above form fields
- Type validation: Zod schema parsing throws on invalid data, caught and stored

**HTTP Status Codes Used:**
- 401: Unauthorized (missing session)
- 400: Bad request (missing company, invalid input)
- 404: Not found (invoice doesn't exist)
- 500: Server error (AI/extraction failure, database errors)
- 201: Created (invoice uploaded successfully)

## Cross-Cutting Concerns

**Logging:**
- Uses console.error() for invoice processing errors
- No centralized logging framework configured
- Location: `src/app/api/invoices/route.ts` line 211

**Validation:**
- Zod schemas for API input/output: `src/lib/ai/parse-response.ts`
- File type/size validation in client component: `src/components/invoices/invoice-upload-form.tsx`
- Session validation on every protected route via `getServerSession(authOptions)`
- RUT format validation via `src/lib/tax/rut-validator.ts`

**Authentication:**
- NextAuth.js with JWT strategy
- Credentials provider (email/password)
- Session passed to all protected API routes
- Dynamically imported bcryptjs to avoid client-side bloat

**Multi-Tenancy:**
- Company membership enforced at API layer: every request checks `companyId`
- User's default company selected from CompanyMembership
- All queries filtered by `companyId` to prevent cross-tenant data access
- Unique constraint on (userId, companyId) pair

---

*Architecture analysis: 2026-02-26*

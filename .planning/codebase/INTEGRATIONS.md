# External Integrations

**Analysis Date:** 2026-02-26

## APIs & External Services

**OpenAI / AI Extraction:**
- OpenAI GPT-4 Vision - Invoice document analysis and data extraction
  - SDK/Client: `openai` 6.24.0
  - Auth: `OPENAI_API_KEY` environment variable
  - Endpoint: `chat.completions.create` with `gpt-4o` model
  - Usage: `src/lib/ai/extract-invoice.ts`
  - Features:
    - Processes invoice images (PNG, JPG, PDF as base64)
    - Extracts structured JSON with invoice metadata
    - Returns confidence scores for extracted data
    - Supports both URL-based and base64-encoded images
    - Uses `response_format: { type: "json_object" }` for structured output

## Data Storage

**Databases:**
- PostgreSQL (primary data store)
  - Connection: `DATABASE_URL` environment variable
  - Direct connection: `DIRECT_DATABASE_URL` (for Prisma)
  - Client: Prisma ORM 7.4.1
  - Adapter: `@prisma/adapter-pg` with connection pooling
  - Schema: `prisma/schema.prisma`
  - Contains: Users, companies, invoices, vendors, line items, IVA rules

**File Storage:**
- Currently: Embedded as base64 data URLs in database (`Invoice.fileUrl` field)
- Plan: S3 or Blob storage (marked as TODO in `src/app/api/invoices/route.ts` line 80)
- File formats supported: image/png, image/jpeg, application/pdf, etc.

**Caching:**
- None detected - All queries direct to PostgreSQL
- Prisma Accelerate extension available (`@prisma/extension-accelerate` 2.0.2) but not actively used in code

## Authentication & Identity

**Auth Provider:**
- NextAuth.js 4.24.13 - Custom implementation
  - Type: Credentials-based (email/password)
  - Session strategy: JWT tokens
  - Sign-in page: `/login`
  - Implementation: `src/lib/auth.ts` and `src/app/api/auth/[...nextauth]/route.ts`

**Authentication Flow:**
1. User submits email + password via login form
2. CredentialsProvider validates against database
3. Password verified using bcryptjs (3.0.3) comparison
4. Session created with JWT token
5. Token includes user ID for subsequent requests

**Session Configuration:**
- Strategy: JWT (not database sessions)
- Secret: `NEXTAUTH_SECRET` environment variable
- URL: `NEXTAUTH_URL` environment variable
- Callbacks: `jwt` and `session` callbacks attach user ID to token

**Database Tables:**
- `User` - User accounts with email, password hash, profile
- `Session` - Session tokens (legacy NextAuth support)
- `Account` - OAuth provider integration structure (configured but not used)
- `CompanyMembership` - Multi-tenant access control with roles (ADMIN, ACCOUNTANT, VIEWER)

## Authorization & Access Control

**Multi-Tenant Architecture:**
- Users belong to Companies via `CompanyMembership`
- Each user can have multiple company memberships
- Default company selected via `CompanyMembership.isDefault`
- Role-based access: `ADMIN`, `ACCOUNTANT`, `VIEWER`

**API Authorization Pattern:**
- All protected endpoints check session and extract user ID
- User's default company ID retrieved from `CompanyMembership`
- Queries scoped to company: `where: { companyId }`
- Example: `src/app/api/invoices/route.ts` lines 9-15

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Datadog, or similar)

**Logging:**
- Console logging only
- Error logs in API routes: `console.error()` for exceptions
- Example: `src/app/api/invoices/route.ts` line 211
- Invoice extraction errors stored in database: `Invoice.extractionError`

## CI/CD & Deployment

**Hosting:**
- Not specified - Project supports serverless (Vercel) or traditional Node.js
- Next.js App Router compatible with Edge Runtime

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or other CI configs found

**Build Output:**
- Next.js builds to `.next/` directory (generated)
- Prisma client generated to `src/generated/prisma/` during build

## Environment Configuration

**Required Environment Variables:**
```
DATABASE_URL        # PostgreSQL connection string with pooling config
DIRECT_DATABASE_URL # Direct connection for Prisma migrations
NEXTAUTH_SECRET     # JWT signing secret (random 32+ chars)
NEXTAUTH_URL        # Base URL for authentication (http://localhost:3000 in dev)
OPENAI_API_KEY      # OpenAI API key (sk-...)
```

**Database URL Format (example from .env.example):**
- Configured as JSON-encoded connection details
- Includes connection pooling parameters
- Separate shadow database for schema validation
- Connection limits and timeout settings

**Secrets Location:**
- `.env` file (local development)
- Environment variables at deployment platform (Vercel, Docker, etc.)
- `NEXTAUTH_SECRET` and `OPENAI_API_KEY` are sensitive

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- NextAuth.js JWT and session callbacks:
  - `jwt` callback: Enriches token with user ID
  - `session` callback: Populates session with user ID
  - Location: `src/lib/auth.ts` lines 46-59

## OpenAI Integration Details

**Invoice Extraction Service:**
- Location: `src/lib/ai/extract-invoice.ts`
- Two entry points:
  1. `extractInvoiceData(fileUrl)` - Accepts URL-based images
  2. `extractInvoiceFromBase64(base64Data, mimeType)` - Accepts base64 data

**Prompt Configuration:**
- System prompt: `EXTRACTION_SYSTEM_PROMPT` from `src/lib/ai/prompts.ts`
- User prompt: `EXTRACTION_USER_PROMPT` from `src/lib/ai/prompts.ts`
- Max tokens: 4096
- Temperature: 0 (deterministic output)
- Image detail: "high" for better accuracy

**Response Parsing:**
- Raw JSON parsed in `src/lib/ai/parse-response.ts`
- Validates response structure and types
- Returns `ExtractionResult` type from `src/types/invoice.ts`

**Data Extracted:**
- Invoice number, date, due date
- Vendor name and RUT
- Currency
- Line items: description, quantity, unit price, totals
- Subtotal, IVA amount, total amount
- Invoice type (FACTURA_A, FACTURA_B, etc.)
- IVA indicators per line item
- Confidence score

## Tax & Compliance Integrations

**RUT Validation:**
- Location: `src/lib/tax/rut-validator.ts`
- Validates Uruguayan RUT format
- Returns cleaned RUT and validation status
- Used for vendor matching and validation

**IVA Classification:**
- Location: `src/lib/tax/iva-classifier.ts`
- Custom rules stored in database: `IvaClassificationRule` model
- Classification methods:
  1. Keyword matching against rules (priority-based)
  2. AI classification fallback
  3. Returns category (BASICA, MINIMA, EXPORTACION, EXONERADO)
- IVA rates calculated per line item

**IVA Categories:**
- Location: `src/lib/tax/iva-categories.ts`
- Supports multiple IVA classification levels
- Stored per company for customization

---

*Integration audit: 2026-02-26*

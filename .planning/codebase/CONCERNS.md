# Codebase Concerns

**Analysis Date:** 2026-02-26

## Tech Debt

**Invoice Storage using Base64 in Database:**
- Issue: Invoice files are stored as base64 data URLs directly in the `fileUrl` field of the database. This is a temporary MVP approach that does not scale.
- Files: `src/app/api/invoices/route.ts` (lines 80-81)
- Impact:
  - Database bloat: Base64 increases file size by ~33% compared to binary storage
  - Performance degradation: Large invoices (10MB) become 13.3MB in database, causing slow queries and backups
  - Memory issues: Storing large PDFs as base64 strings in JSON responses wastes RAM
  - Scalability barrier: Cannot efficiently handle thousands of documents
- Fix approach: Implement cloud storage integration (AWS S3, Cloudflare R2, or similar). Store only the file path/URL in database, keep base64 conversion temporary during upload only.

**Unsafe PATCH Endpoint for Invoice Updates:**
- Issue: The `PATCH /api/invoices/[id]` endpoint accepts arbitrary JSON body and updates invoice record without validation or field restrictions.
- Files: `src/app/api/invoices/[id]/route.ts` (lines 47-51)
- Impact:
  - Authorization bypass: No validation that user owns the invoice being modified
  - Data corruption: Client can modify critical fields like `status`, `totalAmount`, `totalIva` directly without re-extraction
  - Audit trail loss: No tracking of who/what changed invoice data
  - Multi-tenancy breach: Users can potentially modify other companies' invoices if they guess the ID
- Fix approach:
  1. Validate invoice ownership (check companyId matches user's company)
  2. Implement field whitelist (allow only specific fields like `reviewNotes`)
  3. Use Zod schema to validate input
  4. Add audit logging for all updates

**Missing Authorization Checks in Invoice Operations:**
- Issue: Invoice GET, PATCH, and approve endpoints check authentication but not authorization (invoice ownership).
- Files: `src/app/api/invoices/[id]/route.ts` (GET, PATCH), `src/app/api/invoices/[id]/approve/route.ts`
- Impact:
  - Authenticated users can view/modify/approve any invoice if they guess/know the invoice ID
  - Multi-tenancy data leakage: Critical vulnerability for SaaS application
  - Compliance risk: Exposes customer financial data
- Fix approach: Add company membership check before any invoice operation. Retrieve invoice and verify `invoice.companyId === userCompanyId`.

**Unvalidated File Type Acceptance:**
- Issue: Server accepts any file type in formData but only validates on client side.
- Files: `src/app/api/invoices/route.ts` (line 69), `src/components/invoices/invoice-upload-form.tsx` (lines 20-32)
- Impact:
  - Malicious file uploads: Attackers can upload executable files, malware, or other dangerous content
  - OpenAI API abuse: Sending unexpected file formats to GPT-4o Vision wastes tokens and may fail unpredictably
  - DoS vector: Uploading billions of bytes bypasses 10MB client check
- Fix approach: Add server-side file type validation using `file.type` and magic bytes verification. Reject anything not in whitelist before sending to OpenAI.

## Security Considerations

**Credentials and Secrets Exposure in .env.example:**
- Risk: The `.env.example` file contains base64-encoded DATABASE_URL that may decode to sensitive information. NEXTAUTH_SECRET placeholder doesn't match format of real secrets.
- Files: `.env.example`
- Current mitigation: File is in `.gitignore`, but example shows dangerous pattern
- Recommendations:
  - Never include ANY real-looking credential examples (even if fake)
  - Use obvious placeholders like `your-secret-here` or `CHANGE_THIS`
  - Document that DATABASE_URL should use `@` authentication or environment variable, not embedded credentials
  - Add production deployment notes about secrets management

**OpenAI API Key in Runtime Memory:**
- Risk: OPENAI_API_KEY is read on every request and stored in process memory. No validation that key is actually set.
- Files: `src/lib/ai/extract-invoice.ts` (line 8)
- Current mitigation: None
- Recommendations:
  - Validate API key presence at application startup, fail fast
  - Consider rate limiting per company to prevent token abuse
  - Log OpenAI API calls for audit/cost tracking
  - Implement usage quotas per company if multi-tenant

**JWT Token Lacks Expiration Handling:**
- Risk: Session strategy is JWT but no explicit token expiration configuration in NextAuth config.
- Files: `src/lib/auth.ts` (lines 5-8)
- Current mitigation: NextAuth default is 30 days, but not explicitly documented
- Recommendations:
  - Explicitly set `maxAge` in session config for tokens
  - Consider shorter expiration (1-7 days) with refresh token rotation for invoicing app
  - Add logout mechanism on security events (password change, suspicious activity)

**Password Hash Configuration:**
- Risk: bcryptjs with `12` rounds is reasonable but no configuration for password complexity requirements on registration.
- Files: `src/app/api/register/route.ts` (line 30)
- Current mitigation: Zod schema requires min 6 characters, but no uppercase/number/special char rules
- Recommendations:
  - Enforce password complexity: min 12 chars, mixed case, number, special char
  - Add rate limiting on registration endpoint to prevent account enumeration
  - Consider OWASP password guidelines for Uruguayan localization

**Company RUT Not Validated on Registration:**
- Risk: Company RUT in registration accepts 12-char string but doesn't validate Uruguayan RUT checksum.
- Files: `src/app/api/register/route.ts` (line 11), `/c/Users/senti/Documents/VSCode/facturai/src/lib/tax/rut-validator.ts` exists but not used in registration
- Current mitigation: None
- Recommendations:
  - Use `validateRut()` function at registration time
  - Reject invalid RUT formats early
  - Consider uniqueness constraints by RUT for audit trail

## Performance Bottlenecks

**AI Extraction Without Timeout or Cancellation:**
- Problem: OpenAI API calls in `extractInvoiceFromBase64` have no timeout. If GPT-4o hangs, request blocks indefinitely.
- Files: `src/lib/ai/extract-invoice.ts` (lines 49-64)
- Cause: No `timeout` parameter in OpenAI SDK call, async/await without timeout wrapper
- Improvement path:
  1. Add AbortSignal timeout (30-60 seconds recommended)
  2. Implement retry logic with exponential backoff
  3. Consider using OpenAI batch API for background processing instead of real-time calls
  4. Add observability: log extraction time per invoice for SLA monitoring

**Synchronous IVA Classification Query on Every Line Item:**
- Problem: `classifyIva()` queries database for rules on every line item (could be 50+ queries per invoice).
- Files: `src/app/api/invoices/route.ts` (lines 103-126), `src/lib/tax/iva-classifier.ts` (lines 67-73)
- Cause: `await Promise.all()` still executes N database queries. Rules are not cached.
- Improvement path:
  1. Cache IVA classification rules in memory or Redis with 1-hour TTL
  2. Move classification rules to in-process singleton, invalidate on rule updates
  3. Consider moving entire line item classification to client after extraction to parallelize OpenAI + classification

**Large File Upload in Memory:**
- Problem: Invoice upload converts entire file to base64 in memory before storing. 10MB file = 10MB+ RAM allocation.
- Files: `src/app/api/invoices/route.ts` (line 77-78)
- Cause: `Buffer.from(bytes).toString("base64")` creates full buffer in memory
- Improvement path:
  1. Stream file to S3/cloud storage instead of buffering
  2. Use multipart upload for files > 5MB
  3. Implement chunked upload on frontend with resume capability

**No Index on Invoice Status/Company Queries:**
- Problem: Invoice list query filters by `status` and `companyId`, but index exists only on `[companyId, status]` combination.
- Files: `src/app/api/invoices/route.ts` (lines 40-48), `prisma/schema.prisma` (line 158)
- Cause: If filtering by status alone, full table scan on large datasets
- Improvement path:
  1. Index already exists `@@index([companyId, status])` - good
  2. Add separate `@@index([status])` for status-only queries if needed
  3. Monitor query performance in production

## Fragile Areas

**Invoice Status State Machine Not Enforced:**
- Files: `src/app/api/invoices/[id]/route.ts`, `src/app/(dashboard)/invoices/[id]/page.tsx`
- Why fragile: Status transitions are not validated. An invoice can jump from PENDING to APPROVED, or APPROVED back to PROCESSING. No guard rails.
- Safe modification:
  1. Define valid state transitions: PENDING → PROCESSING → EXTRACTED → APPROVED/REJECTED
  2. Add transition validation in API before updating status
  3. Reject invalid transitions with 400 error
- Test coverage: No test files found in codebase; status transitions untested

**File Preview Display Without Security Checks:**
- Files: `src/app/(dashboard)/invoices/[id]/page.tsx` (lines 185-197)
- Why fragile: `fileUrl` containing base64 data URL is directly rendered in `<img>` tag. If extraction stores malicious SVG, could be XSS vector.
- Safe modification:
  1. Sanitize/validate base64 content
  2. Consider rendering PDFs via dedicated viewer (react-pdf) instead of embedded HTML
  3. Add Content Security Policy headers to restrict resource origins
- Test coverage: No XSS or SVG injection tests found

**Raw JSON Extraction Data Stored Without Validation:**
- Files: `src/app/api/invoices/route.ts` (line 160), `prisma/schema.prisma` (line 131)
- Why fragile: `extractionRaw` stores unparsed OpenAI response as JSON. If schema changes or response is malformed, could cause issues downstream.
- Safe modification:
  1. Add version field to `extractionRaw` schema
  2. Implement migration strategy if OpenAI response format changes
  3. Add logging for failed extractions (currently only caught at line 189-200)
- Test coverage: No error case testing for malformed OpenAI responses

**IVA Classifier Default Falls Back to 22% Without Warning:**
- Files: `src/lib/tax/iva-classifier.ts` (lines 86-87)
- Why fragile: If no AI indicator, no matching rule, defaults to BASICA (22%). Accountant may not notice incorrect classification until review.
- Safe modification:
  1. Add `confidence` flag to classification result (HIGH/MEDIUM/LOW)
  2. Mark RULE-based and AI-based as HIGH confidence, DEFAULT as LOW
  3. Highlight DEFAULT classifications in UI for manual review
- Test coverage: No tests for default fallback behavior

## Scaling Limits

**Database Connection Pool Not Configured:**
- Current capacity: Default Prisma pool size (~10 connections)
- Limit: Concurrent requests > 10 will queue, causing latency spikes
- Files: `src/lib/db.ts`, `prisma/schema.prisma`
- Scaling path:
  1. Set explicit `connectionLimit` in DATABASE_URL connection string
  2. For serverless (Vercel), use PgBouncer or Prisma Accelerate (already in deps: `@prisma/extension-accelerate`)
  3. Monitor connection pool exhaustion with observability tools

**No Request Rate Limiting:**
- Current capacity: Unlimited requests per IP/user
- Limit: 100 concurrent invoice uploads = 100 OpenAI API calls, 100+ database transactions
- Limit: Malicious actor can exhaust OpenAI quota and database in seconds
- Scaling path:
  1. Add rate limiting middleware (e.g., `next-rate-limit`)
  2. Implement per-user quotas: max 10 uploads/hour, max 5 concurrent
  3. Add per-company quotas: track total API spend
  4. Reject requests with 429 status when limits exceeded

**No Async Job Queue for Long-Running Tasks:**
- Current capacity: API request holds open for entire AI extraction (5-30 seconds)
- Limit: Hosting provider (Vercel) timeout is 10-30 seconds depending on plan. Long extractions fail silently.
- Scaling path:
  1. Move extraction to background job queue (e.g., Bull, RabbitMQ, or AWS SQS)
  2. Return 202 Accepted immediately with job ID
  3. Implement webhook/polling mechanism for client to check status
  4. Allow invoice upload without waiting for extraction

**No Caching Strategy for Company Data:**
- Current capacity: Every API call loads user's company membership from database
- Limit: Heavy user activity (50+ API calls/min per user) = 50+ identical database queries
- Scaling path:
  1. Cache company membership in session token (already partially done: `token.id`)
  2. Cache company data (name, settings) in Redis with 5-min TTL
  3. Implement cache invalidation on company update

## Dependencies at Risk

**Prisma 7.4.1 with Custom Generated Client:**
- Risk: Codebase has custom generated Prisma client in `src/generated/prisma/` (auto-generated but committed). This can cause version mismatches if dependencies update.
- Impact: If `prisma/schema.prisma` changes but generation is not re-run, generated types are stale
- Migration plan:
  1. Add `prisma generate` to CI/CD pre-commit hooks (already in postinstall)
  2. Never commit changes to `src/generated/prisma/` - regenerate on install
  3. Update `.gitignore` to exclude generated files, use build time generation

**Next.js 16.1.6 with React Compiler (Experimental):**
- Risk: `babel-plugin-react-compiler` 1.0.0 is marked as beta in package.json. May introduce subtle bugs in component rendering.
- Impact: Compiler optimizations could memoize stale closures or skip renders
- Migration plan:
  1. Thoroughly test all interactive features (upload, approval)
  2. Monitor browser console for React warnings
  3. Have fallback: disable React Compiler with `reactCompiler: false` in `next.config.ts` if issues appear
  4. Monitor React compiler releases for stable version

**OpenAI SDK 6.24.0 (Rapid Updates):**
- Risk: OpenAI SDK has frequent breaking changes between minor versions. Current version may become outdated quickly.
- Impact: Function signatures may change, response format may shift
- Migration plan:
  1. Pin to exact version with `6.24.0` (not caret `^6.24.0`) in production
  2. Create abstraction layer for OpenAI calls to isolate version changes
  3. Monitor OpenAI release notes for deprecations
  4. Plan quarterly SDK updates with comprehensive testing

**Zod 4.3.6 Lightweight Validation:**
- Risk: Zod is used for parsing extraction response and registration input, but error messages are not customized. Client receives raw Zod errors.
- Impact: API returns verbose technical error details that expose schema to attackers
- Migration plan:
  1. Wrap Zod parse errors in custom error handler
  2. Return user-friendly error messages only, log detailed errors server-side
  3. Consider switching to more mature validation (e.g., Valibot) if schema becomes complex

## Test Coverage Gaps

**No Tests for Authorization/Multi-Tenancy:**
- What's not tested: Invoice access control, company membership validation, cross-company data leakage
- Files: `src/app/api/invoices/route.ts`, `src/app/api/invoices/[id]/route.ts`, `src/app/api/invoices/[id]/approve/route.ts`
- Risk: Critical vulnerability undiscovered - authenticated user could access any company's invoices
- Priority: HIGH - This is a security issue, requires immediate test coverage

**No Tests for AI Extraction Failures:**
- What's not tested: OpenAI API timeouts, malformed responses, network errors
- Files: `src/lib/ai/extract-invoice.ts`, `src/app/api/invoices/route.ts` (error handling at lines 189-209)
- Risk: Unhandled promise rejections, incomplete error states
- Priority: HIGH - Production resilience depends on this

**No Tests for IVA Classification Rules:**
- What's not tested: Rule matching, priority ordering, default fallback
- Files: `src/lib/tax/iva-classifier.ts`
- Risk: Incorrect tax classifications could cause financial losses
- Priority: HIGH - Business logic correctness critical for Uruguayan tax compliance

**No Tests for Invoice Status Transitions:**
- What's not tested: Invalid state transitions, concurrent updates, race conditions
- Files: `src/app/api/invoices/[id]/route.ts`, `src/app/(dashboard)/invoices/[id]/page.tsx`
- Risk: Invoices could end up in invalid states
- Priority: MEDIUM

**No Tests for File Upload Edge Cases:**
- What's not tested: Large files (>10MB), malformed files, concurrent uploads
- Files: `src/app/api/invoices/route.ts`, `src/components/invoices/invoice-upload-form.tsx`
- Risk: Server crashes, memory exhaustion, DoS vulnerabilities
- Priority: MEDIUM

**No E2E Tests:**
- What's not tested: Complete user flows (register → upload → approve)
- Risk: Integration issues between components not caught
- Priority: MEDIUM - Essential for pre-launch validation

---

*Concerns audit: 2026-02-26*

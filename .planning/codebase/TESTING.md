# Testing Patterns

**Analysis Date:** 2026-02-26

## Test Framework

**Status:** No testing framework currently installed

- No test runner detected (Jest, Vitest, etc. not in dependencies)
- No test files found in codebase (no `.test.ts`, `.spec.ts` files)
- No test configuration files (no `jest.config.ts`, `vitest.config.ts`)
- No testing libraries in `package.json` (no `@testing-library/*`, `jest`, `vitest`)

**Recommendation for Future Implementation:**
When tests are added, consider:
- **Jest** or **Vitest** for unit/integration testing (Vitest recommended for modern TypeScript/ESM)
- **@testing-library/react** for component testing
- **@testing-library/user-event** for user interaction simulation
- **msw** (Mock Service Worker) for API mocking

## Run Commands (Current)

The project does not currently have test scripts configured. When testing is implemented, add to `package.json`:

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Generate coverage report
```

## Testing Opportunities by Module

### 1. Authentication (`/src/lib/auth.ts`, `/src/app/api/auth/[...nextauth]/route.ts`)

**What to test:**
- Credentials validation (email/password required)
- Password hashing/comparison with bcryptjs
- JWT token generation in callbacks
- Session creation and user ID assignment
- NextAuth configuration (providers, callbacks, pages)

**Test type:** Unit tests + Integration tests (with mock database)

**Example areas:**
```typescript
// authorize() callback tests
- Null email/password returns null
- Non-existent user returns null
- Invalid password returns null
- Valid credentials return user object
- bcrypt.compare() called correctly

// jwt() callback tests
- Token augmented with user.id
- Returns token

// session() callback tests
- Session.user augmented with token.id
- Returns session
```

### 2. Tax/IVA Calculation (`/src/lib/tax/iva-classifier.ts`, `/src/lib/tax/rut-validator.ts`)

**What to test:**
- `parseIvaIndicator()` - string parsing for IVA category detection
- `classifyIva()` - AI indicator priority, rule matching, default fallback
- `calculateIvaAmount()` - mathematical correctness of IVA amount calculation
- `validateRut()` - RUT validation algorithm (modulo 11 check digit)

**Test type:** Unit tests (pure functions, no dependencies)

**Example test cases for `parseIvaIndicator()`:**
```typescript
- Parses "22%" → BASICA at 22.0
- Parses "básica" (case-insensitive) → BASICA
- Parses "10%" → MINIMA at 10.0
- Parses "exento" → EXONERADO at 0.0
- Parses "export" → EXPORTACION at 0.0
- Returns null for unmatched strings
- Handles whitespace/trim
```

**Example test cases for `calculateIvaAmount()`:**
```typescript
- IVA rate 0 returns 0
- lineTotal 100 with rate 22 returns correct amount
- Result rounded to 2 decimals
- Formula: lineTotal - (lineTotal / (1 + rate/100))
```

### 3. Invoice Extraction (`/src/lib/ai/extract-invoice.ts`, `/src/lib/ai/parse-response.ts`)

**What to test:**
- `extractInvoiceData()` and `extractInvoiceFromBase64()` - OpenAI API integration
- Response parsing and validation
- Error handling when OpenAI returns empty response

**Test type:** Integration tests (with API mocking via MSW or jest.mock)

**Mocking strategy:**
```typescript
- Mock OpenAI client
- Mock EXTRACTION_SYSTEM_PROMPT and EXTRACTION_USER_PROMPT
- Mock parseExtractionResponse
- Test: API called with correct parameters
- Test: Error thrown when response is empty
- Test: Returns { result, raw } object
```

### 4. API Routes (`/src/app/api/invoices/route.ts`, `/src/app/api/invoices/[id]/approve/route.ts`)

**What to test:**
- Session authentication (401 for unauthenticated)
- Company membership validation (400 for no company)
- GET /api/invoices - fetches with pagination, filtering
- POST /api/invoices - file upload, AI extraction, database updates
- POST /api/invoices/[id]/approve - status update

**Test type:** Integration tests (with mock database, mocked external services)

**Mocking strategy:**
```typescript
- Mock getServerSession
- Mock db client (Prisma)
- Mock extractInvoiceFromBase64
- Mock classifyIva
- Mock validateRut
- Test: 401 returned when no session
- Test: 400 returned when no company
- Test: Files > 10MB rejected
- Test: Extraction errors handled gracefully
```

**Example test structure for POST `/api/invoices`:**
```typescript
describe("POST /api/invoices", () => {
  it("should return 401 when unauthenticated", async () => {
    // Mock: getServerSession returns null
    // Assert: Response status 401, error message
  });

  it("should return 400 when user has no company", async () => {
    // Mock: getServerSession returns user
    // Mock: getUserCompanyId returns null
    // Assert: Response status 400
  });

  it("should process invoice successfully", async () => {
    // Mock: all dependencies
    // POST FormData with file
    // Assert: 201 status, invoice returned
  });

  it("should handle extraction errors gracefully", async () => {
    // Mock: extractInvoiceFromBase64 throws error
    // Assert: Invoice status = ERROR, error message stored
  });
});
```

### 5. UI Components (`/src/components/invoices/invoice-upload-form.tsx`, `/src/components/invoices/iva-badge.tsx`)

**What to test:**
- `InvoiceUploadForm` - drag-drop, file validation, upload flow
- File type validation (JPG, PNG, WebP, PDF only)
- File size validation (max 10MB)
- Loading states and error display
- Form submission and navigation after success

**Test type:** Component tests (React Testing Library)

**Example test cases for `InvoiceUploadForm`:**
```typescript
- Renders upload area with drag-drop zone
- Accepts image/PDF files
- Rejects unsupported file types with error message
- Rejects files > 10MB with error message
- Shows preview for image files
- Shows file metadata (name, size) for PDF
- Disables submit while processing
- Shows processing status UI
- Shows success message on completion
- Navigates to invoice detail page after success
- Handles API errors and displays error message
```

**Mocking strategy:**
```typescript
- Mock useRouter
- Mock fetch API
- Create file objects for testing
- Simulate drag-drop events
```

### 6. Middleware (`/src/middleware.ts`)

**What to test:**
- Public routes accessible without token
- Protected routes redirect to /login when no token
- Already-logged-in users redirect from /login, /register to /dashboard
- Matcher correctly identifies protected routes

**Test type:** Unit tests (with mocked Next.js functions)

**Example test cases:**
```typescript
- GET /login → NextResponse.next() when no token
- GET /dashboard → redirect to /login when no token
- GET /dashboard → NextResponse.next() when token present
- GET /login with token → redirect to /dashboard
```

## Current Testing Approach

**Manual Testing Only:**
- No automated tests
- Functionality tested through:
  - Browser-based manual testing (UI interaction)
  - Postman/curl testing of API endpoints
  - Database inspection to verify data persistence

**Integration Testing Approach:**
- End-to-end flows tested manually:
  1. User registration and login
  2. Invoice file upload
  3. AI extraction verification
  4. IVA classification review
  5. Invoice approval workflow

## Test Coverage Gaps

**Critical untested areas:**
- Authentication flow (no unit/integration tests)
- Tax calculation logic (untested edge cases)
- API route handlers (no endpoint tests)
- Component state management (no UI tests)
- Error handling paths (no error scenario tests)

**Priority for test implementation:**
1. **High:** Tax calculation functions (business logic, reusable)
2. **High:** API authentication (security-critical)
3. **Medium:** Invoice extraction (complex, multiple dependencies)
4. **Medium:** Component interaction (user-facing features)
5. **Low:** Utility functions (well-scoped, low risk)

## Best Practices for Future Tests

**File organization:**
- Co-locate test files with source: `component.tsx` and `component.test.tsx` in same directory
- Or create `__tests__` directory structure mirroring `src/`

**Naming:**
- Test suite: `describe("ComponentName", () => { ... })`
- Test case: `it("should do specific thing", () => { ... })`
- Clear, behavior-driven names

**Mocking:**
- Mock external dependencies (API, database, file system)
- Keep mocks close to test files
- Use factory functions for test data

**Assertions:**
- One logical assertion per test (or multiple related assertions)
- Use meaningful assertion messages
- Test both happy path and error cases

**Coverage targets:**
- Aim for 70%+ coverage on business logic
- 100% coverage on tax calculation (critical)
- 80%+ coverage on API routes
- 50%+ coverage on UI components (80%+ for complex forms)

---

*Testing analysis: 2026-02-26*

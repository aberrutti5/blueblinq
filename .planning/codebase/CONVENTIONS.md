# Coding Conventions

**Analysis Date:** 2026-02-26

## Naming Patterns

**Files:**
- Component files: kebab-case with `.tsx` extension (e.g., `invoice-upload-form.tsx`)
- API route files: use Next.js convention with `route.ts` in directories matching endpoint paths
- Utility/lib files: kebab-case with `.ts` extension (e.g., `rut-validator.ts`, `iva-classifier.ts`)
- Type definition files: same directory as code or in dedicated `types/` directory with descriptive names (e.g., `invoice.ts`, `tax.ts`)

**Functions:**
- camelCase for all function names (async and sync)
- Examples: `extractInvoiceFromBase64()`, `classifyIva()`, `validateRut()`, `calculateIvaAmount()`, `handleFile()`, `handleDrop()`
- Async functions use async/await pattern, not Promise chains

**Variables:**
- camelCase for local variables and state
- State hook variables: `const [status, setStatus] = useState()`
- Object properties in destructuring and imports use camelCase
- Example: `const { companyId, userId } = ...`

**Types:**
- PascalCase for interface names
- Examples: `ExtractionResult`, `ClassificationResult`, `InvoiceSummary`, `ExtractedLineItem`
- Union types and enums use SCREAMING_SNAKE_CASE from Prisma schema (e.g., `BASICA`, `MINIMA`, `EXONERADO`)

**Constants:**
- SCREAMING_SNAKE_CASE for exported constants (from generated Prisma enums)
- camelCase for local constants used within functions
- Example: `const navigation = [...]`, `const statusLabels = {...}`

## Code Style

**Formatting:**
- No explicit Prettier config detected; follows Next.js defaults
- Uses 2-space indentation (evident from all source files)
- Line length: appears to follow standard conventions (under 100-120 chars typically)
- Semicolons: present and used consistently

**Linting:**
- ESLint enabled via `eslint.config.mjs` in flat config format
- Uses Next.js core web vitals preset: `eslint-config-next/core-web-vitals`
- Uses TypeScript support: `eslint-config-next/typescript`
- Global ignores configured for: `.next/`, `out/`, `build/`, `next-env.d.ts`
- Prisma-generated files explicitly excluded with `/* eslint-disable */`

**Type Safety:**
- TypeScript strict mode enabled (`"strict": true`)
- Target: ES2017
- Module resolution: bundler
- JSX: react-jsx

## Import Organization

**Order:**
1. Third-party imports (React, Next.js, external libraries)
2. Type imports with `import type` when needed
3. Relative imports from `@/` alias for internal code
4. Specific component/function imports before wildcard/default imports

**Path Aliases:**
- Configured with `@/*` → `./src/*` in `tsconfig.json`
- All internal imports use the `@/` prefix
- Examples:
  - `import { cn } from "@/lib/utils"`
  - `import { Button } from "@/components/ui/button"`
  - `import { db } from "@/lib/db"`
  - `import { authOptions } from "@/lib/auth"`

**Example import pattern from `/src/app/api/invoices/route.ts`:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractInvoiceFromBase64 } from "@/lib/ai/extract-invoice";
import { classifyIva, calculateIvaAmount } from "@/lib/tax/iva-classifier";
import { validateRut } from "@/lib/tax/rut-validator";
```

## Error Handling

**Patterns:**
- Use try/catch blocks for async operations
- Check for null/undefined with optional chaining (`?.`) and nullish coalescing (`??`)
- Return null or early return pattern for validation failures
- Error messages: localized to Spanish for user-facing errors (e.g., "No autorizado", "Sin empresa", "Error en la extracción")
- Extraction errors captured and stored in database with original Error message or fallback text
- Examples from `/src/app/api/invoices/route.ts`:
  ```typescript
  if (!credentials?.email || !credentials?.password) return null;
  if (!user || !user.passwordHash) return null;
  return membership?.companyId ?? null;
  ```
- Error objects: check `instanceof Error` before accessing `.message`
  ```typescript
  extractionError instanceof Error
    ? extractionError.message
    : "Error desconocido en la extracción"
  ```

**HTTP Error Responses:**
- Use `NextResponse.json({ error: "message" }, { status: 401 })` pattern
- Status codes: 401 for unauthorized, 400 for bad request, 500 for server errors, 201 for creation success

## Logging

**Framework:** console (no centralized logging library detected)

**Patterns:**
- `console.error()` for error logging: used in route handlers for unexpected failures
- Example: `console.error("Invoice upload error:", error);`
- Logging typically done at entry points (API routes, middleware)
- Limited logging in business logic; errors surfaced through HTTP responses

## Comments

**When to Comment:**
- Complex algorithmic logic (e.g., RUT validation, IVA calculation)
- Non-obvious business rules (e.g., "In Uruguay, lineTotal on invoices typically INCLUDES IVA")
- Step-by-step process comments for multi-stage operations
- Comments explain WHY not WHAT (code should be self-documenting)

**Patterns observed:**
- Single-line comments for section headers: `// 1. Try AI indicator`, `// 2. Rule-based matching`
- Inline comments explaining business logic: `// Dynamic import to avoid bundling bcrypt on client`
- Comments above complex calculations explaining the formula

**JSDoc/TSDoc:**
- Minimal usage; types defined through TypeScript interfaces
- No extensive function documentation observed; type definitions serve as documentation
- Example from `/src/lib/tax/iva-classifier.ts`: interface `ClassificationResult` documents return shape

## Function Design

**Size:**
- Keep functions focused and under 50 lines when possible
- API routes are larger (100+ lines) due to multi-step processing logic
- Utility functions extracted to prevent duplication

**Parameters:**
- Use destructuring for objects in function parameters
- Example: `{ params }: { params: Promise<{ id: string }> }` for Next.js route params
- Prefer object parameters over multiple positional arguments
- Async functions accepting request/response objects

**Return Values:**
- Explicit return type annotations on exported functions
- Return NextResponse, Promise<T>, or typed objects
- Example: `async function extractInvoiceFromBase64(...): Promise<{ result: ExtractionResult; raw: unknown }>`

**Async/Await:**
- Consistently use async/await over Promise chains
- Use `Promise.all()` for parallel operations
- Example: `const [invoices, total] = await Promise.all([...])`

## Module Design

**Exports:**
- Named exports for utilities and functions
- Default exports for React components (pages and layouts)
- Example: `export function InvoiceUploadForm()` vs `export default function InvoicesPage()`
- Type exports use `export type` or `import type`

**Barrel Files:**
- Not extensively used; imports are typically direct
- Components imported directly from their file
- Could consider barrel files in `components/ui/` if growth continues

**File Structure by Layer:**
- `/src/app/` - Next.js pages and route handlers
- `/src/components/` - React components (UI, layout, forms)
- `/src/lib/` - Business logic, utilities, integrations (auth, db, AI, tax)
- `/src/types/` - TypeScript type definitions
- `/src/middleware.ts` - Next.js middleware for auth

**Component Organization:**
- UI components in `/src/components/ui/` (shadcn pattern)
- Feature components in `/src/components/invoices/` or `/src/components/layout/`
- Props defined inline or through dedicated types
- Client components marked with `"use client"` directive

## React & Next.js Specifics

**Component Types:**
- Pages use default export with PascalCase function (e.g., `export default function InvoicesPage()`)
- Server components by default (unless `"use client"` directive present)
- Client components: form submission, state management, event handlers
- Layouts are server components containing SessionProvider and structural elements

**Hooks Usage:**
- Standard hooks: `useState`, `useEffect`, `useCallback`, `useRouter`, `usePathname`
- Example: `const router = useRouter()` for navigation after submission

**State Management:**
- React hooks for local component state
- NextAuth for session state
- Prisma for database state
- No Redux, Zustand, or other state management library

**API Integration:**
- Direct `fetch()` calls from client components
- Async/await pattern for HTTP requests
- Error handling with `res.ok` check and JSON parsing

---

*Convention analysis: 2026-02-26*

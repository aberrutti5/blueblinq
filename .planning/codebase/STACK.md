# Technology Stack

**Analysis Date:** 2026-02-26

## Languages

**Primary:**
- TypeScript 5.x - All application code, configuration files
- JSX/TSX - React component development

**Secondary:**
- JavaScript (ES2017 target) - Configuration files (ESLint, PostCSS)
- SQL - PostgreSQL queries via Prisma ORM

## Runtime

**Environment:**
- Node.js (version not pinned, lockfile version 3)
- Browser: Modern ES2017+ support

**Package Manager:**
- npm (8.x or higher)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router
- React 19.2.3 - UI component library
- React DOM 19.2.3 - DOM rendering

**UI/Styling:**
- Tailwind CSS 4 - Utility-first CSS framework via `@tailwindcss/postcss`
- Radix UI 1.4.3 - Accessible component primitives
- shadcn 3.8.5 - High-quality Tailwind components
- CVA (class-variance-authority) 0.7.1 - Type-safe component variants
- Lucide React 0.575.0 - Icon library
- Recharts 3.7.0 - Charting library for dashboards

**Data & ORM:**
- Prisma 7.4.1 - Database ORM and schema management
- `@prisma/adapter-pg` 7.4.1 - PostgreSQL adapter
- `@prisma/client` 7.4.1 - Prisma client
- `@prisma/extension-accelerate` 2.0.2 - Query acceleration

**Authentication:**
- NextAuth.js 4.24.13 - Session and authentication management
- bcryptjs 3.0.3 - Password hashing

**Utilities:**
- Zod 4.3.6 - Schema validation
- Decimal.js 10.6.0 - Precise decimal arithmetic (for financial data)
- date-fns 4.1.0 - Date manipulation
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.5.0 - Tailwind class merging
- sonner 2.0.7 - Toast notifications
- next-themes 0.4.6 - Dark mode theming

**AI/ML:**
- OpenAI 6.24.0 - GPT-4 Vision API for invoice extraction

## Build & Development

**Build Tool:**
- Next.js built-in build system (via TypeScript)
- Babel React Compiler 1.0.0 - React optimization
- PostCSS 4.x - CSS transformation

**Linting & Code Quality:**
- ESLint 9.x - JavaScript/TypeScript linting
- eslint-config-next 16.1.6 - Next.js ESLint preset
- TypeScript strict mode enabled

**Development:**
- TypeScript compiler with strict type checking
- Tailwind CSS JIT compilation via Tailwindcss 4

## Key Dependencies

**Critical:**
- Prisma (7.4.1) - Database persistence, data models, migrations
- Next.js (16.1.6) - Framework, routing, API endpoints
- NextAuth.js (4.24.13) - Authentication and session management
- OpenAI (6.24.0) - AI-powered invoice data extraction via GPT-4 Vision
- React/React DOM (19.2.3) - UI rendering

**Infrastructure:**
- `@prisma/adapter-pg` (7.4.1) - PostgreSQL connection pooling
- `@prisma/extension-accelerate` (2.0.2) - Query optimization
- bcryptjs (3.0.3) - Secure password hashing
- Zod (4.3.6) - API request/response validation

**Styling & UI:**
- Tailwind CSS (4.x) - Utility-first CSS
- Radix UI (1.4.3) - Unstyled accessible components
- shadcn (3.8.5) - Pre-styled Radix components

## Configuration

**Environment:**
- `.env` file (not committed) - Contains sensitive configuration
- `.env.example` - Template with placeholder values
- Configuration via environment variables:
  - `DATABASE_URL` - Primary database connection string
  - `DIRECT_DATABASE_URL` - Direct PostgreSQL connection (for Prisma)
  - `NEXTAUTH_SECRET` - JWT signing secret
  - `NEXTAUTH_URL` - Authentication base URL
  - `OPENAI_API_KEY` - OpenAI API credentials

**Build:**
- `next.config.ts` - Next.js configuration with React Compiler enabled
- `tsconfig.json` - TypeScript configuration with path aliases (`@/*`)
- `postcss.config.mjs` - PostCSS configuration with Tailwind plugin
- `prisma.config.ts` - Prisma configuration pointing to schema in `prisma/schema.prisma`
- `eslint.config.mjs` - ESLint configuration (flat config format)

## Database

**Primary:**
- PostgreSQL - Managed via Prisma ORM
- Connection: Via `DATABASE_URL` environment variable
- Adapter: `@prisma/adapter-pg` for connection pooling
- Schema: `prisma/schema.prisma`
- Migrations: Stored in `prisma/migrations/`

**Data Models:**
- User authentication and multi-tenancy
- Company and company memberships
- Invoices with line items
- Vendors management
- IVA classification rules
- All using Prisma Decimal type for financial precision

## File Storage

**Current Implementation:**
- Base64 data URLs in database (MVP approach)
- Stored in `Invoice.fileUrl` field
- Comment indicates future migration to S3/Blob storage (see `src/app/api/invoices/route.ts` line 80)

## Platform Requirements

**Development:**
- Node.js (modern version supporting ES2017+)
- npm or compatible package manager
- PostgreSQL 12+ for database
- OpenAI API key for invoice extraction

**Production:**
- Node.js runtime
- PostgreSQL 12+ database
- OpenAI API access
- Suitable for serverless deployment (Vercel, etc.) or traditional Node.js hosting
- Environment variables configured at deployment platform

**Browser Support:**
- Modern browsers supporting ES2017+ (Chrome, Firefox, Safari, Edge)

---

*Stack analysis: 2026-02-26*

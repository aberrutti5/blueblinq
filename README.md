# FacturAI

Automatización de facturas con IA para empresas uruguayas. Extrae datos de facturas usando GPT-4o Vision y clasifica automáticamente el IVA según la normativa de Uruguay.

## Features

- **Extracción con IA**: Subí una foto o PDF de tu factura y la IA extrae automáticamente todos los datos
- **Clasificación de IVA**: Cada producto se clasifica automáticamente con su tasa de IVA correcta (22% básica, 10% mínima, 0% exportación, exonerado)
- **Validación de RUT**: Validación automática del RUT del proveedor
- **Multi-empresa**: Un usuario puede gestionar múltiples empresas
- **Revisión y aprobación**: El contador revisa los datos extraídos y aprueba con un click

## Tech Stack

- **Framework**: Next.js 16 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Base de datos**: PostgreSQL + Prisma v7
- **AI/OCR**: OpenAI GPT-4o Vision
- **Auth**: NextAuth.js

## Setup

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar base de datos local con Prisma
npx prisma dev

# Ejecutar migraciones
npm run db:push

# Seed de reglas IVA
npm run db:seed

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de entorno

```
DATABASE_URL=       # PostgreSQL connection string
NEXTAUTH_SECRET=    # Secret para NextAuth
NEXTAUTH_URL=       # URL de la app (http://localhost:3000)
OPENAI_API_KEY=     # API key de OpenAI
```

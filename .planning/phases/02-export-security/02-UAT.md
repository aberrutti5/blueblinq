---
status: testing
phase: 02-export-security
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md
started: 2026-02-26T23:00:00Z
updated: 2026-02-26T23:00:00Z
---

## Current Test

number: 1
name: Exportar CSV button visible
expected: |
  On the /invoices page, the page header shows two buttons side by side:
  an "Exportar CSV" button (outline style, with a download icon) and the existing "Subir factura" button.
awaiting: user response

## Tests

### 1. Exportar CSV button visible
expected: On the /invoices page, the page header shows two buttons side by side: an "Exportar CSV" button (outline style, with a download icon) and the existing "Subir factura" button.
result: [pending]

### 2. CSV file download
expected: Clicking the "Exportar CSV" button triggers a browser file download named "facturas.csv". Opening the file in a spreadsheet shows a header row with columns: Numero, Fecha, Proveedor, RUT Proveedor, Tipo, Subtotal, IVA, Total, Moneda, Estado. Each invoice appears as one row beneath.
result: [pending]

### 3. CSV download requires login
expected: Opening /api/invoices/export directly in a browser while logged out returns a 401 error (or redirects to login). The file download does NOT work without an active session.
result: [pending]

### 4. Invalid file type rejected on upload
expected: On the invoice upload form, attempting to upload a non-image/non-PDF file (e.g., a .txt or .exe file — rename any file to test) shows an error: "Tipo de archivo no permitido. Usá JPG, PNG, WebP o PDF." The file is not processed.
result: [pending]

### 5. Invalid RUT rejected at registration
expected: On the registration page, entering a company RUT with an invalid checksum (e.g., "123456789012") and submitting shows a "RUT de empresa inválido" error. A valid RUT (correct 12-digit format with valid checksum) still registers successfully.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0

## Gaps

[none yet]

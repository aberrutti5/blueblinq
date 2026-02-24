import { InvoiceUploadForm } from "@/components/invoices/invoice-upload-form";

export default function UploadInvoicePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Subir factura</h1>
        <p className="text-gray-600 mt-1">
          Subí una foto o PDF de tu factura. La IA extraerá los datos
          automáticamente y clasificará cada producto con su tasa de IVA.
        </p>
      </div>
      <InvoiceUploadForm />
    </div>
  );
}

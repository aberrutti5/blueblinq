"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { IvaBadge } from "@/components/invoices/iva-badge";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Hash,
  DollarSign,
  Loader2,
} from "lucide-react";

interface InvoiceData {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  status: string;
  invoiceType: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  vendorName: string | null;
  vendorRut: string | null;
  currency: string;
  subtotal: string | null;
  totalIva: string | null;
  totalAmount: string | null;
  confidence: number | null;
  extractionError: string | null;
  lineItems: {
    id: string;
    lineNumber: number;
    description: string;
    quantity: string;
    unitPrice: string;
    lineTotal: string;
    ivaCategory: "BASICA" | "MINIMA" | "EXPORTACION" | "EXONERADO";
    ivaRate: string;
    ivaAmount: string;
    classifiedBy: string;
  }[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-gray-100 text-gray-800" },
  PROCESSING: { label: "Procesando", color: "bg-blue-100 text-blue-800" },
  EXTRACTED: { label: "Extraído", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Aprobado", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rechazado", color: "bg-red-100 text-red-800" },
  ERROR: { label: "Error", color: "bg-red-100 text-red-800" },
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchInvoice = async () => {
      const res = await fetch(`/api/invoices/${params.id}`);
      const data = await res.json();
      if (active) {
        setInvoice(data);
        setLoading(false);
      }
      return data;
    };

    fetchInvoice().then((data) => {
      if (!active || data?.status !== "PROCESSING") return;
      intervalId = setInterval(async () => {
        const updated = await fetchInvoice();
        if (!active || updated?.status !== "PROCESSING") {
          if (intervalId) clearInterval(intervalId);
        }
      }, 2000);
    });

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [params.id]);

  const handleApprove = async () => {
    setApproving(true);
    const res = await fetch(`/api/invoices/${params.id}/approve`, {
      method: "POST",
    });
    if (res.ok) {
      const updated = await res.json();
      setInvoice(updated);
    }
    setApproving(false);
  };

  const handleReject = async () => {
    const res = await fetch(`/api/invoices/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setInvoice(updated);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!invoice) {
    return <p className="text-red-600">Factura no encontrada</p>;
  }

  const statusInfo = statusLabels[invoice.status] ?? statusLabels.PENDING;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/invoices")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">
            Factura {invoice.invoiceNumber ?? invoice.id.slice(0, 8)}
          </h1>
          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          {invoice.confidence != null && (
            <Badge variant="outline">
              Confianza: {Math.round(invoice.confidence * 100)}%
            </Badge>
          )}
        </div>
        {invoice.status === "EXTRACTED" && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
            <Button onClick={handleApprove} disabled={approving}>
              {approving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Aprobar
            </Button>
          </div>
        )}
      </div>

      {/* Processing indicator */}
      {invoice.status === "PROCESSING" && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-md flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div>
            <p className="font-medium">Procesando factura...</p>
            <p className="text-sm">La IA está extrayendo los datos. Esto se actualiza automáticamente.</p>
          </div>
        </div>
      )}

      {/* Error */}
      {invoice.extractionError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p className="font-medium">Error en la extracción</p>
          <p className="text-sm">{invoice.extractionError}</p>
        </div>
      )}

      {/* Two column layout: Image + Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original document */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documento original</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.fileType.startsWith("image/") ? (
              <img
                src={invoice.fileUrl}
                alt="Factura"
                className="rounded-lg w-full object-contain max-h-[600px]"
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <p className="text-gray-500">
                  PDF: {invoice.fileName}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extracted data */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos extraídos</CardTitle>
              <CardDescription>
                Información extraída automáticamente por IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 mt-1 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Proveedor</p>
                    <p className="font-medium">
                      {invoice.vendorName ?? "—"}
                    </p>
                    {invoice.vendorRut && (
                      <p className="text-xs text-gray-500">
                        RUT: {invoice.vendorRut}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-1 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Fecha</p>
                    <p className="font-medium">
                      {invoice.invoiceDate
                        ? new Date(invoice.invoiceDate).toLocaleDateString(
                            "es-UY"
                          )
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 mt-1 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Tipo / Número</p>
                    <p className="font-medium">
                      {invoice.invoiceType?.replace("_", " ") ?? "—"}{" "}
                      {invoice.invoiceNumber ?? ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 mt-1 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-xl font-bold">
                      {invoice.currency}{" "}
                      {invoice.totalAmount
                        ? Number(invoice.totalAmount).toLocaleString("es-UY", {
                            minimumFractionDigits: 2,
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Totals breakdown */}
              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>
                    {invoice.subtotal
                      ? Number(invoice.subtotal).toLocaleString("es-UY", {
                          minimumFractionDigits: 2,
                        })
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">IVA Total</span>
                  <span>
                    {invoice.totalIva
                      ? Number(invoice.totalIva).toLocaleString("es-UY", {
                          minimumFractionDigits: 2,
                        })
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>
                    {invoice.totalAmount
                      ? Number(invoice.totalAmount).toLocaleString("es-UY", {
                          minimumFractionDigits: 2,
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Line items table */}
      {invoice.lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Productos / Servicios ({invoice.lineItems.length} ítems)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Cant.</TableHead>
                  <TableHead className="text-right">P. Unit.</TableHead>
                  <TableHead className="text-right">Total línea</TableHead>
                  <TableHead>IVA</TableHead>
                  <TableHead className="text-right">Monto IVA</TableHead>
                  <TableHead>Clasif.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-gray-400">
                      {item.lineNumber}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(item.quantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(item.unitPrice).toLocaleString("es-UY", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {Number(item.lineTotal).toLocaleString("es-UY", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <IvaBadge category={item.ivaCategory} />
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(item.ivaAmount).toLocaleString("es-UY", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.classifiedBy}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

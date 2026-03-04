"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
  ZoomIn,
  ZoomOut,
  RotateCcw,
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

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

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

  const handleZoomIn = () => {
    setZoomLevel((prev) => {
      const idx = ZOOM_LEVELS.indexOf(prev);
      return idx < ZOOM_LEVELS.length - 1 ? ZOOM_LEVELS[idx + 1] : prev;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const idx = ZOOM_LEVELS.indexOf(prev);
      return idx > 0 ? ZOOM_LEVELS[idx - 1] : prev;
    });
  };

  const handleZoomReset = () => setZoomLevel(1);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoomLevel((prev) => {
          const idx = ZOOM_LEVELS.indexOf(prev);
          return idx < ZOOM_LEVELS.length - 1 ? ZOOM_LEVELS[idx + 1] : prev;
        });
      } else {
        setZoomLevel((prev) => {
          const idx = ZOOM_LEVELS.indexOf(prev);
          return idx > 0 ? ZOOM_LEVELS[idx - 1] : prev;
        });
      }
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    const container = imageContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = imageContainerRef.current;
    if (!container) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    container.scrollLeft = dragStart.current.scrollLeft - dx;
    container.scrollTop = dragStart.current.scrollTop - dy;
  };

  const handleMouseUp = () => setIsDragging(false);

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
    <div className="space-y-4">
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
            <p className="text-sm">
              La IA está extrayendo los datos. Esto se actualiza
              automáticamente.
            </p>
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

      {/* Metadata bar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Proveedor:</span>
              <span className="font-medium">
                {invoice.vendorName ?? "—"}
              </span>
              {invoice.vendorRut && (
                <span className="text-gray-400 text-xs">
                  ({invoice.vendorRut})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Fecha:</span>
              <span className="font-medium">
                {invoice.invoiceDate
                  ? new Date(invoice.invoiceDate).toLocaleDateString("es-UY")
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hash className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Tipo:</span>
              <span className="font-medium">
                {invoice.invoiceType?.replace("_", " ") ?? "—"}{" "}
                {invoice.invoiceNumber ?? ""}
              </span>
            </div>
            <div className="h-4 border-l border-gray-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Subtotal:</span>
              <span className="font-medium">
                {invoice.subtotal
                  ? Number(invoice.subtotal).toLocaleString("es-UY", {
                      minimumFractionDigits: 2,
                    })
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">IVA:</span>
              <span className="font-medium">
                {invoice.totalIva
                  ? Number(invoice.totalIva).toLocaleString("es-UY", {
                      minimumFractionDigits: 2,
                    })
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Total:</span>
              <span className="font-bold text-base">
                {invoice.currency}{" "}
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

      {/* Main comparison: Image + Line Items side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Invoice image with zoom */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              Documento original
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={handleZoomOut}
                disabled={zoomLevel <= ZOOM_LEVELS[0]}
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-gray-500 w-12 text-center tabular-nums">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={handleZoomIn}
                disabled={zoomLevel >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleZoomReset}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {invoice.fileType.startsWith("image/") ? (
              <div
                ref={imageContainerRef}
                className="overflow-auto max-h-[70vh] border-t"
                style={{
                  cursor:
                    zoomLevel > 1
                      ? isDragging
                        ? "grabbing"
                        : "grab"
                      : "default",
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={invoice.fileUrl}
                  alt="Factura"
                  className="w-full select-none"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "top left",
                    width: `${100 * zoomLevel}%`,
                  }}
                  draggable={false}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 border-t">
                <p className="text-gray-500">PDF: {invoice.fileName}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line items table */}
        <Card className="flex flex-col">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">
              Productos / Servicios
              {invoice.lineItems.length > 0 && (
                <span className="text-gray-400 font-normal ml-1">
                  ({invoice.lineItems.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-auto max-h-[70vh] border-t">
            {invoice.lineItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8 text-xs">#</TableHead>
                    <TableHead className="text-xs">Descripción</TableHead>
                    <TableHead className="text-right text-xs">Cant.</TableHead>
                    <TableHead className="text-right text-xs">
                      P. Unit.
                    </TableHead>
                    <TableHead className="text-right text-xs">Total</TableHead>
                    <TableHead className="text-xs">IVA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-gray-400 text-xs py-2">
                        {item.lineNumber}
                      </TableCell>
                      <TableCell
                        className="text-xs py-2 max-w-[200px] truncate"
                        title={item.description}
                      >
                        {item.description}
                      </TableCell>
                      <TableCell className="text-right text-xs py-2">
                        {Number(item.quantity)}
                      </TableCell>
                      <TableCell className="text-right text-xs py-2">
                        {Number(item.unitPrice).toLocaleString("es-UY", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right text-xs py-2 font-medium">
                        {Number(item.lineTotal).toLocaleString("es-UY", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="py-2">
                        <IvaBadge category={item.ivaCategory} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                Sin productos extraídos
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

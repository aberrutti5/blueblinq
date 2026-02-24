"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, Eye } from "lucide-react";

interface InvoiceSummary {
  id: string;
  fileName: string;
  status: string;
  invoiceType: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  vendorName: string | null;
  currency: string;
  totalAmount: string | null;
  createdAt: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-gray-100 text-gray-800" },
  PROCESSING: { label: "Procesando", color: "bg-blue-100 text-blue-800" },
  EXTRACTED: { label: "Extraído", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Aprobado", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rechazado", color: "bg-red-100 text-red-800" },
  ERROR: { label: "Error", color: "bg-red-100 text-red-800" },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => setInvoices(data.invoices ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facturas</h1>
          <p className="text-gray-600">
            Todas las facturas procesadas por IA
          </p>
        </div>
        <Link href="/invoices/upload">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Subir factura
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Listado de facturas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Upload className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No hay facturas todavía</p>
              <p className="text-sm mb-4">
                Subí tu primera factura para comenzar
              </p>
              <Link href="/invoices/upload">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir factura
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Tipo / Nro</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => {
                  const st =
                    statusLabels[inv.status] ?? statusLabels.PENDING;
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">
                        {inv.vendorName ?? inv.fileName}
                      </TableCell>
                      <TableCell>
                        {inv.invoiceType?.replace("_", " ") ?? "—"}{" "}
                        {inv.invoiceNumber ?? ""}
                      </TableCell>
                      <TableCell>
                        {inv.invoiceDate
                          ? new Date(inv.invoiceDate).toLocaleDateString(
                              "es-UY"
                            )
                          : new Date(inv.createdAt).toLocaleDateString(
                              "es-UY"
                            )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {inv.totalAmount
                          ? `${inv.currency} ${Number(
                              inv.totalAmount
                            ).toLocaleString("es-UY", {
                              minimumFractionDigits: 2,
                            })}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={st.color}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/invoices/${inv.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

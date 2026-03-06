"use client";

import { useEffect, useState, useCallback } from "react";
import type { RpaJobResult } from "@/lib/memory-rpa/types";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Eye,
  Download,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react";

function JobStatusIcon({ status }: { status: RpaJobResult["status"] }) {
  if (status === "SUCCESS")
    return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (status === "FAILED") return <XCircle className="h-4 w-4 text-red-600" />;
  if (status === "RUNNING")
    return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
  return <Clock className="h-4 w-4 text-gray-400" />;
}

const jobStatusLabel: Record<RpaJobResult["status"], string> = {
  PENDING: "En cola",
  RUNNING: "Ejecutando",
  SUCCESS: "Completado",
  FAILED: "Falló",
};

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<RpaJobResult[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<InvoiceSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInvoices = useCallback(async (): Promise<InvoiceSummary[]> => {
    const res = await fetch("/api/invoices");
    const data = await res.json();
    return data.invoices ?? [];
  }, []);

  const fetchJobs = useCallback(async () => {
    const res = await fetch("/api/invoices/memory-sync/batch");
    if (res.ok) {
      const data = await res.json();
      setJobs(data.jobs ?? []);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let invoiceInterval: ReturnType<typeof setInterval> | null = null;
    const jobInterval = setInterval(() => {
      if (active) fetchJobs();
    }, 3000);

    const load = async () => {
      const list = await fetchInvoices();
      if (!active) return;
      setInvoices(list);
      setLoading(false);

      if (list.some((inv: InvoiceSummary) => inv.status === "PROCESSING")) {
        invoiceInterval = setInterval(async () => {
          const updated = await fetchInvoices();
          if (!active) return;
          setInvoices(updated);
          if (!updated.some((i: InvoiceSummary) => i.status === "PROCESSING")) {
            if (invoiceInterval) clearInterval(invoiceInterval);
            invoiceInterval = null;
          }
        }, 5000);
      }
    };

    load();
    fetchJobs();

    return () => {
      active = false;
      if (invoiceInterval) clearInterval(invoiceInterval);
      clearInterval(jobInterval);
    };
  }, [fetchInvoices, fetchJobs]);

  const approvedInvoices = invoices.filter((inv) => inv.status === "APPROVED");
  const allApprovedSelected =
    approvedInvoices.length > 0 &&
    approvedInvoices.every((inv) => selected.has(inv.id));

  const toggleSelectAll = () => {
    if (allApprovedSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(approvedInvoices.map((inv) => inv.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSyncBatch = async () => {
    if (selected.size === 0) return;
    setSyncing(true);
    setSyncError(null);
    const res = await fetch("/api/invoices/memory-sync/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceIds: Array.from(selected) }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    setSyncing(false);
    if (!res.ok) {
      if (res.status === 401) {
        setSyncError("Sesión expirada. Volvé a iniciar sesión.");
      } else {
        setSyncError(data.error ?? "Error al encolar facturas");
      }
    } else {
      setSelected(new Set());
      await fetchJobs();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/invoices/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== deleteTarget.id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
    }
  };

  const DELETABLE_STATUSES = ["EXTRACTED", "REVIEW", "APPROVED"];

  const recentJobs = jobs.slice(-10).reverse();
  const activeJobCount = jobs.filter(
    (j) => j.status === "PENDING" || j.status === "RUNNING"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facturas</h1>
          <p className="text-gray-600">Todas las facturas procesadas por IA</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button onClick={handleSyncBatch} disabled={syncing}>
              {syncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar {selected.size} a Memory
            </Button>
          )}
          <a href="/api/invoices/export" download>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </a>
          <Link href="/invoices/upload">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Subir factura
            </Button>
          </Link>
        </div>
      </div>

      {syncError && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-md flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          {syncError}
          {syncError.includes("credenciales") && (
            <Link href="/settings" className="underline font-medium ml-1">
              Ir a Ajustes
            </Link>
          )}
        </div>
      )}

      {recentJobs.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Cola de sincronización con Memory
              {activeJobCount > 0 && (
                <Badge className="bg-blue-100 text-blue-800">
                  {activeJobCount} en progreso
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Factura</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs">Inicio</TableHead>
                  <TableHead className="text-xs">Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobs.map((job) => {
                  const inv = invoices.find((i) => i.id === job.invoiceId);
                  return (
                    <TableRow key={job.jobId}>
                      <TableCell className="text-xs py-2">
                        {inv?.vendorName ?? inv?.fileName ?? job.invoiceId.slice(0, 8)}
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="flex items-center gap-1.5 text-xs">
                          <JobStatusIcon status={job.status} />
                          {jobStatusLabel[job.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs py-2 text-gray-500">
                        {job.startedAt
                          ? new Date(job.startedAt).toLocaleTimeString("es-UY")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs py-2 text-red-600 max-w-[200px] truncate">
                        {job.error ?? ""}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Listado de facturas
            {approvedInvoices.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                Seleccioná las aprobadas para enviar a Memory
              </span>
            )}
          </CardTitle>
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
                  <TableHead className="w-8">
                    {approvedInvoices.length > 0 && (
                      <input
                        type="checkbox"
                        checked={allApprovedSelected}
                        onChange={toggleSelectAll}
                        className="rounded"
                        title="Seleccionar todas las aprobadas"
                      />
                    )}
                  </TableHead>
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
                  const st = statusLabels[inv.status] ?? statusLabels.PENDING;
                  const isApproved = inv.status === "APPROVED";
                  return (
                    <TableRow
                      key={inv.id}
                      className={selected.has(inv.id) ? "bg-blue-50" : ""}
                    >
                      <TableCell>
                        {isApproved && (
                          <input
                            type="checkbox"
                            checked={selected.has(inv.id)}
                            onChange={() => toggleSelect(inv.id)}
                            className="rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {inv.vendorName ?? inv.fileName}
                      </TableCell>
                      <TableCell>
                        {inv.invoiceType?.replace("_", " ") ?? "—"}{" "}
                        {inv.invoiceNumber ?? ""}
                      </TableCell>
                      <TableCell>
                        {inv.invoiceDate
                          ? new Date(inv.invoiceDate).toLocaleDateString("es-UY")
                          : new Date(inv.createdAt).toLocaleDateString("es-UY")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {inv.totalAmount
                          ? `${inv.currency} ${Number(inv.totalAmount).toLocaleString("es-UY", { minimumFractionDigits: 2 })}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={st.color}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/invoices/${inv.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                          {DELETABLE_STATUSES.includes(inv.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteTarget(inv)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar factura</DialogTitle>
            <DialogDescription>
              ¿Seguro que querés eliminar{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.vendorName ?? deleteTarget?.fileName}
              </span>
              ?
              {deleteTarget?.status === "APPROVED" && (
                <span className="block mt-2 text-amber-600 text-sm">
                  Esta factura ya está aprobada. Eliminándola se perderán los datos extraídos.
                </span>
              )}
              <span className="block mt-1 text-sm">Esta acción no se puede deshacer.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

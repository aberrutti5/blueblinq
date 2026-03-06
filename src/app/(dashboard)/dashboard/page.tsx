"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  total: number;
  extracted: number;
  approved: number;
  pending: number;
  errors: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/invoices/stats")
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  const cards = [
    {
      title: "Total facturas",
      value: stats?.total,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Pendientes de revisión",
      value: stats?.extracted,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Aprobadas",
      value: stats?.approved,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Errores",
      value: stats?.errors,
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Resumen de tus facturas procesadas</p>
        </div>
        <Link href="/invoices/upload">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Subir factura
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {stats === null ? (
                <Skeleton className="h-9 w-12" />
              ) : (
                <p className="text-3xl font-bold">{card.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {stats !== null && stats.total === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Upload className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Bienvenido a BlueBlinq
            </h2>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Subí tu primera factura y la IA extraerá automáticamente todos los
              productos con su clasificación de IVA según la normativa uruguaya.
            </p>
            <Link href="/invoices/upload">
              <Button size="lg">
                <Upload className="h-5 w-5 mr-2" />
                Subir primera factura
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

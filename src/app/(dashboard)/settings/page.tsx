"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [configured, setConfigured] = useState(false);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    fetch("/api/settings/memory")
      .then((r) => r.json())
      .then((data) => {
        setConfigured(data.configured);
        setSavedEmail(data.memoryEmail);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");
    const res = await fetch("/api/settings/memory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setSaving(false);
    if (res.ok) {
      setConfigured(true);
      setSavedEmail(email);
      setPassword("");
      setStatus("success");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-gray-600">Configuración de integraciones</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Credenciales de Memory
            {configured && (
              <span className="inline-flex items-center gap-1 text-sm font-normal text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Configurado
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Estas credenciales se usarán para ingresar facturas aprobadas a
            Memory automáticamente. Se guardan cifradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedEmail && (
            <p className="text-sm text-gray-500 mb-4">
              Email actual:{" "}
              <span className="font-medium text-gray-800">{savedEmail}</span>
            </p>
          )}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="memory-email">Email de Memory</Label>
              <Input
                id="memory-email"
                type="email"
                placeholder="contador@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="memory-password">
                {configured ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}
              </Label>
              <Input
                id="memory-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!configured}
              />
            </div>

            {status === "success" && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Credenciales guardadas correctamente
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Error al guardar. Intentá de nuevo.
              </p>
            )}

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {configured ? "Actualizar credenciales" : "Guardar credenciales"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

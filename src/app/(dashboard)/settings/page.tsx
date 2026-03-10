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
import { CheckCircle2, AlertCircle, Loader2, Mail, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ─── Memory credentials section ──────────────────────────────────

function MemorySettings() {
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
  );
}

// ─── Email scan / IMAP section ────────────────────────────────────

interface EmailScanConfig {
  host: string | null;
  port: number | null;
  user: string | null;
  folder: string;
  enabled: boolean;
  lastRun: string | null;
  configured: boolean;
}

interface ScanResult {
  scanned: number;
  imported: number;
  skipped: number;
  errors: string[];
}

function EmailScanSettings() {
  const [config, setConfig] = useState<EmailScanConfig>({
    host: "",
    port: 993,
    user: "",
    folder: "INBOX",
    enabled: false,
    lastRun: null,
    configured: false,
  });
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/email-scan")
      .then((r) => r.json())
      .then((data: EmailScanConfig) => setConfig(data));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus("idle");
    const res = await fetch("/api/settings/email-scan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: config.host,
        port: config.port,
        user: config.user,
        password: password || undefined,
        folder: config.folder,
        enabled: config.enabled,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setPassword("");
      setSaveStatus("success");
      setConfig((c) => ({ ...c, configured: true }));
    } else {
      setSaveStatus("error");
    }
  };

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    setScanError(null);
    const res = await fetch("/api/email-scan/run", { method: "POST" });
    const data = await res.json();
    setScanning(false);
    if (res.ok) {
      setScanResult(data as ScanResult);
      setConfig((c) => ({ ...c, lastRun: new Date().toISOString() }));
    } else {
      setScanError(data.error ?? "Error al escanear");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Escaneo de facturas por email
          {config.configured && (
            <span className="inline-flex items-center gap-1 text-sm font-normal text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Configurado
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Conectá tu casilla de correo vía IMAP para importar automáticamente
          los adjuntos PDF e imagen de facturas recibidas. Los emails procesados
          se marcan como leídos para no reimportarse.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="space-y-1">
              <Label htmlFor="imap-host">Servidor IMAP</Label>
              <Input
                id="imap-host"
                placeholder="imap.gmail.com"
                value={config.host ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, host: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="imap-port">Puerto</Label>
              <Input
                id="imap-port"
                type="number"
                placeholder="993"
                className="w-24"
                value={config.port ?? ""}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, port: parseInt(e.target.value) || null }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="imap-user">Usuario (email)</Label>
            <Input
              id="imap-user"
              type="email"
              placeholder="facturas@empresa.com"
              value={config.user ?? ""}
              onChange={(e) => setConfig((c) => ({ ...c, user: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="imap-password">
              {config.configured
                ? "Contraseña (dejar vacío para no cambiar)"
                : "Contraseña / App Password"}
            </Label>
            <Input
              id="imap-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!config.configured}
            />
            <p className="text-xs text-gray-500">
              Para Gmail usá una{" "}
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                contraseña de aplicación
              </a>{" "}
              (no la contraseña de tu cuenta).
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="imap-folder">Carpeta IMAP</Label>
            <Input
              id="imap-folder"
              placeholder="INBOX"
              value={config.folder}
              onChange={(e) => setConfig((c) => ({ ...c, folder: e.target.value }))}
            />
          </div>

          {saveStatus === "success" && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Configuración guardada
            </p>
          )}
          {saveStatus === "error" && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Error al guardar. Revisá los datos.
            </p>
          )}

          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {config.configured ? "Actualizar configuración" : "Guardar configuración"}
          </Button>
        </form>

        {config.configured && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Escanear ahora</p>
                {config.lastRun ? (
                  <p className="text-xs text-gray-500">
                    Último escaneo:{" "}
                    {format(new Date(config.lastRun), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">Nunca ejecutado</p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleScan}
                disabled={scanning}
              >
                {scanning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {scanning ? "Escaneando..." : "Escanear bandeja"}
              </Button>
            </div>

            {scanResult && (
              <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm space-y-1">
                <p className="font-medium text-green-800">Escaneo completado</p>
                <ul className="text-green-700 space-y-0.5">
                  <li>Emails revisados: {scanResult.scanned}</li>
                  <li>Facturas importadas: {scanResult.imported}</li>
                  <li>Omitidas (sin adjuntos o duplicadas): {scanResult.skipped}</li>
                </ul>
                {scanResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-red-700">Errores:</p>
                    {scanResult.errors.map((e, i) => (
                      <p key={i} className="text-red-600 text-xs">
                        {e}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {scanError && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm">
                <p className="font-medium text-red-800 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Error al escanear
                </p>
                <p className="text-red-700 mt-1">{scanError}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-gray-600">Configuración de integraciones</p>
      </div>

      <MemorySettings />
      <EmailScanSettings />
    </div>
  );
}

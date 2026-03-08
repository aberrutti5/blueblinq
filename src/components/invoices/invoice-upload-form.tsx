"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, FileImage, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

export function InvoiceUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(f.type)) {
      setError("Formato no soportado. Usá JPG, PNG, WebP o PDF.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("El archivo no puede superar 10MB.");
      return;
    }
    setFile(f);
    setError("");

    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!file) return;

    setStatus("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setStatus("processing");

      const res = await fetch("/api/invoices", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al procesar la factura");
      }

      const invoice = await res.json();
      setStatus("success");

      setTimeout(() => {
        router.push(`/invoices/${invoice.id}`);
      }, 1000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : file
            ? "border-green-300 bg-green-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <CardContent className="p-0">
          <label
            className="flex flex-col items-center justify-center min-h-[300px] cursor-pointer"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="hidden"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            {preview ? (
              <div className="relative w-full max-w-md p-4">
                <img
                  src={preview}
                  alt="Vista previa"
                  className="rounded-lg shadow-md max-h-[400px] mx-auto object-contain"
                />
                <p className="text-center mt-2 text-sm text-gray-600">
                  {file?.name}
                </p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-2">
                {file.type === "application/pdf" ? (
                  <FileText className="h-12 w-12 text-red-500" />
                ) : (
                  <FileImage className="h-12 w-12 text-green-500" />
                )}
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {file.type === "application/pdf" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    PDF — procesamiento optimizado
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <Upload className="h-12 w-12" />
                <p className="text-lg font-medium">
                  Arrastrá tu factura acá
                </p>
                <p className="text-sm">
                  O hacé click para seleccionar. <strong>PDF recomendado</strong> (también JPG, PNG, WebP). Máx. 10MB
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Los PDF con texto se procesan más rápido y con menor costo
                </p>
              </div>
            )}
          </label>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-md text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Status */}
      {status === "processing" && (
        <div className="flex items-center gap-3 bg-blue-50 text-blue-700 p-4 rounded-md">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div>
            <p className="font-medium">Procesando con IA...</p>
            <p className="text-sm">
              Extrayendo datos y clasificando productos. Esto puede tomar unos
              segundos.
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="flex items-center gap-3 bg-green-50 text-green-700 p-4 rounded-md">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-medium">
            Factura procesada exitosamente. Redirigiendo...
          </p>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!file || status === "processing" || status === "uploading"}
        size="lg"
        className="w-full"
      >
        {status === "processing" || status === "uploading" ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Procesar factura con IA
          </>
        )}
      </Button>
    </div>
  );
}

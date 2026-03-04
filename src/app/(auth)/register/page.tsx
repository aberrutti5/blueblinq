"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:        formData.get("name"),
        email:       formData.get("email"),
        phone:       formData.get("phone"),
        password:    formData.get("password"),
        companyName: formData.get("companyName"),
        companyRut:  formData.get("companyRut"),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al registrar");
      setLoading(false);
      return;
    }

    router.push("/login");
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#040810" }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 40%, rgba(37,82,206,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Logo */}
      <Link
        href="/"
        className="relative z-10 mb-10 text-xl tracking-tight"
        style={{
          fontFamily: "'Funnel Sans', sans-serif",
          fontWeight: 700,
          color: "#3F6EE8",
          textDecoration: "none",
        }}
      >
        BlueBlinq.
      </Link>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border px-8 py-10"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h1
          className="text-white text-xl font-semibold mb-1"
          style={{ fontFamily: "'Funnel Sans', sans-serif" }}
        >
          Crear cuenta
        </h1>
        <p
          className="text-white/40 text-sm mb-8"
          style={{ fontFamily: "'Funnel Sans', sans-serif", fontWeight: 300 }}
        >
          Empezá a automatizar tus facturas hoy
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="text-sm p-3 rounded-lg"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                color: "#F87171",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              {error}
            </div>
          )}

          {/* ── Datos personales ── */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-white/60 text-xs"
              style={{ fontFamily: "'Funnel Sans', sans-serif" }}
            >
              Nombre completo
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Juan Pérez"
              required
              className="text-white placeholder:text-white/20 border-white/10 focus:border-[#2452CE] focus:ring-[#2452CE]/20"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-white/60 text-xs"
              style={{ fontFamily: "'Funnel Sans', sans-serif" }}
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@empresa.com"
              required
              className="text-white placeholder:text-white/20 border-white/10 focus:border-[#2452CE] focus:ring-[#2452CE]/20"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-white/60 text-xs"
              style={{ fontFamily: "'Funnel Sans', sans-serif" }}
            >
              Celular
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="099 123 456"
              required
              className="text-white placeholder:text-white/20 border-white/10 focus:border-[#2452CE] focus:ring-[#2452CE]/20"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-white/60 text-xs"
              style={{ fontFamily: "'Funnel Sans', sans-serif" }}
            >
              Contraseña
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              minLength={6}
              required
              className="text-white placeholder:text-white/20 border-white/10 focus:border-[#2452CE] focus:ring-[#2452CE]/20"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            />
          </div>

          {/* ── Divider empresa ── */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            <span
              className="text-white/25 text-xs"
              style={{ fontFamily: "'Funnel Sans', sans-serif" }}
            >
              Tu empresa
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="companyName"
              className="text-white/60 text-xs"
              style={{ fontFamily: "'Funnel Sans', sans-serif" }}
            >
              Nombre de la empresa
            </Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Mi Empresa S.R.L."
              required
              className="text-white placeholder:text-white/20 border-white/10 focus:border-[#2452CE] focus:ring-[#2452CE]/20"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="companyRut"
              className="text-white/60 text-xs"
              style={{ fontFamily: "'Funnel Sans', sans-serif" }}
            >
              RUT de la empresa
            </Label>
            <Input
              id="companyRut"
              name="companyRut"
              placeholder="123456789012"
              maxLength={12}
              required
              className="text-white placeholder:text-white/20 border-white/10 focus:border-[#2452CE] focus:ring-[#2452CE]/20"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={loading}
            style={{
              backgroundColor: "#2452CE",
              color: "white",
              boxShadow: "0 0 24px rgba(36,82,206,0.35)",
              fontFamily: "'Funnel Sans', sans-serif",
            }}
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </Button>
        </form>

        <p
          className="mt-6 text-center text-xs text-white/30"
          style={{ fontFamily: "'Funnel Sans', sans-serif" }}
        >
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="text-[#3F6EE8] hover:text-[#5B8AF7] transition-colors"
          >
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  );
}

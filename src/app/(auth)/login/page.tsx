"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
    } else {
      router.refresh();
      router.push("/dashboard");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#040810" }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 45%, rgba(37,82,206,0.10) 0%, transparent 70%)",
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
        className="relative z-10 w-full max-w-sm rounded-2xl border px-8 py-10"
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
          Ingresar
        </h1>
        <p
          className="text-white/40 text-sm mb-8"
          style={{ fontFamily: "'Funnel Sans', sans-serif", fontWeight: 300 }}
        >
          Accedé a tu cuenta de BlueBlinq
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
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <p
          className="mt-6 text-center text-xs text-white/30"
          style={{ fontFamily: "'Funnel Sans', sans-serif" }}
        >
          ¿No tenés cuenta?{" "}
          <Link
            href="/register"
            className="text-[#3F6EE8] hover:text-[#5B8AF7] transition-colors"
          >
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
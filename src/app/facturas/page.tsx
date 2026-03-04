import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Sparkles,
  Shield,
  FileText,
  Clock,
  AlertTriangle,
  Zap,
  BarChart3,
  Users,
  MessageCircle,
  Check,
  ArrowRight,
  Brain,
  Settings,
} from "lucide-react";

const WHATSAPP_NUMBER = "59893768645";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quiero%20probar%20BlueBlinq`;

const font = { fontFamily: "'Funnel Sans', sans-serif" };
const fontLight = { ...font, fontWeight: 300 as const };
const fontBold = { ...font, fontWeight: 700 as const };

/* ── Data ──────────────────────────────────────────── */

const painPoints = [
  { icon: Clock, text: "Horas cargando facturas a mano" },
  { icon: AlertTriangle, text: "Errores en RUT, montos e IVA" },
  { icon: FileText, text: "Pilas de papel sin procesar" },
];

const solutionPoints = [
  { icon: Zap, text: "Procesadas en segundos" },
  { icon: Shield, text: "+95% de precisión" },
  { icon: Sparkles, text: "IVA clasificado automáticamente" },
];

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Subí la factura",
    description: "Foto desde el celular, PDF o imagen. Desde cualquier dispositivo.",
  },
  {
    number: "02",
    icon: Brain,
    title: "El modelo extrae todo",
    description: "Emisor, RUT, líneas, montos, IVA — en segundos y sin errores.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Exportá o aprobá",
    description: "Revisá, aprobá y exportá a CSV listo para tu sistema contable.",
  },
];

const features = [
  {
    icon: Settings,
    title: "Dashboard a tu medida",
    description: "Personalizado con los KPIs que importan para tu negocio.",
  },
  {
    icon: Shield,
    title: "Reglas IVA por rubro",
    description: "Básico, mínimo o exonerado según tu actividad y normativa DGI.",
  },
  {
    icon: Users,
    title: "Roles por usuario",
    description: "El dueño ve todo, el contador aprueba, el admin carga.",
  },
  {
    icon: BarChart3,
    title: "Exportación CSV",
    description: "Compatible con cualquier sistema contable que uses hoy.",
  },
  {
    icon: MessageCircle,
    title: "Soporte por WhatsApp",
    description: "Te respondemos rápido, como tiene que ser.",
  },
  {
    icon: Sparkles,
    title: "Todos los comprobantes DGI",
    description: "Facturas A/B/C/E, tickets, notas de crédito/débito, resguardos.",
  },
];

const trustPoints = [
  "Modelo de extracción avanzado",
  "Todos los comprobantes DGI",
  "+95% precisión en extracción",
  "Base de datos dedicada por empresa",
  "Encriptación de datos en tránsito",
];

/* ── Page ──────────────────────────────────────────── */

export default function FacturasLanding() {
  return (
    <div className="bb-landing min-h-screen text-white overflow-x-hidden flex flex-col">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 42% 38%, rgba(37,82,206,0.14) 0%, transparent 70%)",
        }}
      />

      {/* Grid pattern */}
      <svg
        aria-hidden
        className="pointer-events-none fixed inset-0 w-full h-full opacity-[0.04] z-0"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#4A7CF0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* ── Nav ──────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto w-full shrink-0">
        <Link href="/">
          <span className="text-lg tracking-tight" style={{ ...fontBold, color: "#3F6EE8" }}>
            BlueBlinq.
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              className="text-white/60 hover:text-white hover:!bg-white/5 border border-white/0 hover:border-white/10"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </a>
          <Link href="/register">
            <Button className="bg-[#2452CE] hover:bg-[#1D44B8] text-white border border-[#2452CE]/50 shadow-[0_0_20px_rgba(36,82,206,0.3)]">
              Probar gratis
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative z-10 px-8 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="mb-6 leading-[1.08] tracking-tight"
            style={{
              ...fontBold,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
            }}
          >
            ¿Cuántas horas perdés
            <br />
            <span style={{ color: "#5B8AF7", textShadow: "0 0 40px #5B8AF750" }}>
              cargando facturas?
            </span>
          </h1>

          <p
            className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto mb-4 leading-relaxed"
            style={fontLight}
          >
            BlueBlinq procesa tus facturas automáticamente.
            Sacás foto, subís el PDF, y en segundos tenés{" "}
            <span style={{ color: "#7AA3F8" }}>
              emisor, RUT, montos e IVA extraídos y clasificados
            </span>{" "}
            automáticamente.
          </p>

          <p
            className="text-white/25 text-xs mb-10 tracking-widest uppercase"
            style={font}
          >
            Solución a medida · Instalación personalizada · Soporte directo
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-[#2452CE] hover:bg-[#1D44B8] text-white px-8 shadow-[0_0_30px_rgba(36,82,206,0.4)] border border-[#2452CE]/60"
              >
                Probá gratis con 10 facturas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="!bg-transparent border-white/15 text-white/75 hover:!bg-white/5 hover:border-white/25 hover:text-white px-8"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Hablá con nosotros
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Problema → Solución ──────────────────── */}
      <section className="relative z-10 border-t border-white/[0.06] px-8 py-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Problema */}
          <div>
            <span
              className="text-xs uppercase tracking-widest text-red-400/70 mb-4 block"
              style={font}
            >
              El problema
            </span>
            <h2
              className="text-2xl mb-8 text-white/90"
              style={fontBold}
            >
              Carga manual = errores + tiempo perdido
            </h2>
            <div className="space-y-5">
              {painPoints.map((p, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <p.icon className="h-5 w-5 text-red-400/70" />
                  </div>
                  <span className="text-white/60 text-sm" style={font}>{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Solución */}
          <div>
            <span
              className="text-xs uppercase tracking-widest mb-4 block"
              style={{ ...font, color: "#3F6EE8" }}
            >
              La solución
            </span>
            <h2
              className="text-2xl mb-8 text-white/90"
              style={fontBold}
            >
              BlueBlinq lo hace por vos
            </h2>
            <div className="space-y-5">
              {solutionPoints.map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(36,82,206,0.1)", border: "1px solid rgba(36,82,206,0.2)" }}>
                    <s.icon className="h-5 w-5" style={{ color: "#3F6EE8" }} />
                  </div>
                  <span className="text-white/60 text-sm" style={font}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ────────────────────────── */}
      <section className="relative z-10 border-t border-white/[0.06] px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl md:text-3xl text-center mb-4 text-white/90"
            style={fontBold}
          >
            Cómo funciona
          </h2>
          <p className="text-white/40 text-sm text-center mb-14" style={fontLight}>
            Tres pasos. Sin complicaciones.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div
                key={i}
                className="relative rounded-xl p-6 text-center"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  className="text-xs font-mono block mb-4"
                  style={{ color: "#3F6EE8" }}
                >
                  {step.number}
                </span>
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "rgba(36,82,206,0.1)", border: "1px solid rgba(36,82,206,0.15)" }}>
                  <step.icon className="h-6 w-6" style={{ color: "#5B8AF7" }} />
                </div>
                <h3 className="text-white/90 text-sm font-medium mb-2" style={font}>
                  {step.title}
                </h3>
                <p className="text-white/40 text-xs leading-relaxed" style={fontLight}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section className="relative z-10 border-t border-white/[0.06] px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl md:text-3xl text-center mb-4 text-white/90"
            style={fontBold}
          >
            Solución a medida para tu negocio
          </h2>
          <p className="text-white/40 text-sm text-center mb-14" style={fontLight}>
            No es un software genérico. Lo configuramos específicamente para vos.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-xl p-5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: "rgba(36,82,206,0.1)" }}>
                  <f.icon className="h-4 w-4" style={{ color: "#3F6EE8" }} />
                </div>
                <h3 className="text-white/90 text-sm font-medium mb-1" style={font}>
                  {f.title}
                </h3>
                <p className="text-white/35 text-xs leading-relaxed" style={fontLight}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust / Confianza ────────────────────── */}
      <section className="relative z-10 border-t border-white/[0.06] px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-xl md:text-2xl mb-8 text-white/90"
            style={fontBold}
          >
            Tecnología de primer nivel, adaptada a Uruguay
          </h2>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {trustPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5" style={{ color: "#3F6EE8" }} />
                <span className="text-white/45 text-sm" style={font}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────── */}
      <section className="relative z-10 border-t border-white/[0.06] px-8 py-20">
        <div
          className="max-w-3xl mx-auto text-center rounded-2xl p-10 md:p-14"
          style={{
            background: "rgba(36,82,206,0.06)",
            border: "1px solid rgba(36,82,206,0.15)",
          }}
        >
          <h2
            className="text-2xl md:text-3xl mb-4 text-white/90"
            style={fontBold}
          >
            Probá BlueBlinq con tus facturas reales
          </h2>
          <p className="text-white/45 text-sm mb-8 max-w-lg mx-auto" style={fontLight}>
            Te procesamos 10 facturas gratis para que veas los resultados.
            Sin compromiso, sin tarjeta de crédito.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-[#2452CE] hover:bg-[#1D44B8] text-white px-8 shadow-[0_0_30px_rgba(36,82,206,0.4)] border border-[#2452CE]/60"
              >
                Empezar gratis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="!bg-transparent border-white/15 text-white/75 hover:!bg-white/5 hover:border-white/25 hover:text-white px-8"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp directo
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 py-8 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/">
            <span className="text-sm" style={{ ...fontBold, color: "#3F6EE8" }}>
              BlueBlinq.
            </span>
          </Link>
          <span className="text-white/20 text-xs" style={font}>
            © {new Date().getFullYear()} BlueBlinq. Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </div>
  );
}

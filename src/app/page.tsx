import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload, Zap, Shield, FileText } from "lucide-react";

const brandLines = [
  { text: "BlueBlinq", color: "#5B8AF7", indent: "0rem" },
  { text: "BluBlueBlinq", color: "#3F6EE8", indent: "0rem" },
  { text: "BluBlueBlueBlinq", color: "#2452CE", indent: "0rem" },
  { text: "BlueBlueBlinq.", color: "#3F6EE8", indent: "4.5rem" },
  { text: "BlueBlinq.", color: "#5B8AF7", indent: "9rem" },
];

const features = [
  {
    icon: Upload,
    title: "Subí tu factura",
    description: "PDFs, imágenes o XMLs desde cualquier dispositivo.",
  },
  {
    icon: Zap,
    title: "IA extrae los datos",
    description: "Emisor, RUT, montos e IVA identificados al instante.",
  },
  {
    icon: Shield,
    title: "IVA clasificado",
    description: "Básico, mínimo o exonerado según normativa uruguaya.",
  },
  {
    icon: FileText,
    title: "Exportá al instante",
    description: "CSV o Excel listos para tu sistema contable.",
  },
];

export default function Home() {
  return (
    <div className="bb-landing min-h-screen text-white overflow-hidden">
      {/* Ambient glow background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 42% 38%, rgba(37,82,206,0.14) 0%, transparent 70%)",
        }}
      />

      {/* Speed lines decoration */}
      <svg
        aria-hidden
        className="pointer-events-none fixed inset-0 w-full h-full opacity-[0.04]"
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

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto w-full">
        <span
          className="text-lg tracking-tight"
          style={{ fontFamily: "'Funnel Sans', sans-serif", fontWeight: 700, color: "#3F6EE8" }}
        >
          BlueBlinq.
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/5 border border-white/0 hover:border-white/10"
            >
              Ingresar
            </Button>
          </Link>
          <Link href="/register">
            <Button
              className="bg-[#2452CE] hover:bg-[#1D44B8] text-white border border-[#2452CE]/50 shadow-[0_0_20px_rgba(36,82,206,0.3)]"
            >
              Registrarse
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[82vh] px-8 text-center">
        {/* Lightning bolt brand name */}
        <div className="mb-12 flex flex-col items-start">
          {brandLines.map((line, i) => (
            <div
              key={i}
              className="bb-bolt-line"
              style={{
                paddingLeft: line.indent,
                color: line.color,
                fontFamily: "'Funnel Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 5.5vw, 4rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                textShadow: `0 0 50px ${line.color}50, 0 0 100px ${line.color}20`,
              }}
            >
              {line.text}
            </div>
          ))}
        </div>

        {/* Tagline */}
        <p
          className="text-white/45 text-base sm:text-lg max-w-sm mb-10 leading-relaxed"
          style={{ fontFamily: "'Funnel Sans', sans-serif", fontWeight: 300 }}
        >
          Automatizá la extracción y clasificación de tus facturas con
          inteligencia artificial.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/login">
            <Button
              size="lg"
              className="bg-[#2452CE] hover:bg-[#1D44B8] text-white px-8 shadow-[0_0_30px_rgba(36,82,206,0.4)] border border-[#2452CE]/60"
            >
              Ingresar
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="lg"
              variant="outline"
              className="border-white/15 text-white/75 hover:bg-white/5 hover:border-white/25 hover:text-white px-8"
            >
              Crear cuenta
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="relative z-10 border-t border-white/[0.06] px-8 py-20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {features.map((f, i) => (
            <div key={i} className="flex flex-col gap-3 group">
              <div className="w-8 h-8 flex items-center justify-center">
                <f.icon
                  className="h-5 w-5 transition-colors"
                  style={{ color: "#3F6EE8" }}
                />
              </div>
              <h3
                className="text-white/90 text-sm font-medium"
                style={{ fontFamily: "'Funnel Sans', sans-serif" }}
              >
                {f.title}
              </h3>
              <p
                className="text-white/35 text-xs leading-relaxed"
                style={{ fontFamily: "'Funnel Sans', sans-serif", fontWeight: 300 }}
              >
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span
            className="text-sm"
            style={{ fontFamily: "'Funnel Sans', sans-serif", fontWeight: 700, color: "#3F6EE8" }}
          >
            BlueBlinq.
          </span>
          <span className="text-white/20 text-xs" style={{ fontFamily: "'Funnel Sans', sans-serif" }}>
            © {new Date().getFullYear()} BlueBlinq. Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </div>
  );
}

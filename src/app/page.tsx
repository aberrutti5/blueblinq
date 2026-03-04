import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Shield, FileText } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Cargá tu factura",
    description: "PDFs, imágenes o XMLs desde cualquier dispositivo, en segundos.",
  },
  {
    icon: Sparkles,
    title: "Extracción automática",
    description: "Emisor, RUT, montos e IVA identificados automáticamente.",
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
              className="text-white/60 hover:text-white hover:!bg-white/5 border border-white/0 hover:border-white/10"
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

      {/* ── Hero ─────────────────────────────────── */}
      <section
        className="relative z-10 flex overflow-hidden"
        style={{ minHeight: "calc(100vh - 80px)" }}
      >
        {/* Left: content */}
        <div className="flex flex-col justify-center px-8 lg:px-16 py-16 w-full lg:w-[52%] shrink-0">
          <h1
            className="mb-6 leading-[1.08] tracking-tight"
            style={{
              fontFamily: "'Funnel Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
            }}
          >
            Tus facturas,{" "}
            <span style={{ color: "#5B8AF7", textShadow: "0 0 40px #5B8AF750" }}>
              procesadas
              <br />
              al instante.
            </span>
          </h1>

          <p
            className="text-white/50 text-base sm:text-lg max-w-md mb-3 leading-relaxed"
            style={{ fontFamily: "'Funnel Sans', sans-serif", fontWeight: 300 }}
          >
            Cargá tus facturas y dejá que BlueBlinq extraiga{" "}
            <span style={{ color: "#7AA3F8" }}>emisor, RUT, montos e IVA</span>{" "}
            automáticamente. Exportá directo a tu sistema contable.
          </p>

          <p
            className="text-white/25 text-xs mb-10 tracking-widest uppercase"
            style={{ fontFamily: "'Funnel Sans', sans-serif" }}
          >
            PDF · Imagen · XML · Normativa uruguaya
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-[#2452CE] hover:bg-[#1D44B8] text-white px-8 shadow-[0_0_30px_rgba(36,82,206,0.4)] border border-[#2452CE]/60"
              >
                Empezar gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="!bg-transparent border-white/15 text-white/75 hover:!bg-white/5 hover:border-white/25 hover:text-white px-8"
              >
                Ingresar
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: image via CSS background (más confiable que next/image con fill) */}
        <div
          aria-hidden
          className="hidden lg:block absolute right-0 top-0 bottom-0"
          style={{
            width: "52%",
            backgroundImage: "url('/hero.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Fade izquierda */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, #040810 0%, rgba(4,8,16,0.6) 30%, transparent 60%)",
            }}
          />
          {/* Fade abajo */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, #040810 0%, transparent 25%)",
            }}
          />
        </div>

      </section>

      {/* ── Features ─────────────────────────────── */}
      <section className="relative z-10 border-t border-white/[0.06] px-8 py-20 shrink-0">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {features.map((f, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <f.icon className="h-5 w-5" style={{ color: "#3F6EE8" }} />
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

      {/* ── Footer ───────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 py-8 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span
            className="text-sm"
            style={{ fontFamily: "'Funnel Sans', sans-serif", fontWeight: 700, color: "#3F6EE8" }}
          >
            BlueBlinq.
          </span>
          <span
            className="text-white/20 text-xs"
            style={{ fontFamily: "'Funnel Sans', sans-serif" }}
          >
            © {new Date().getFullYear()} BlueBlinq. Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </div>
  );
}

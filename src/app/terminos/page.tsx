import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos y Condiciones · BlueBlinq",
  description:
    "Términos y condiciones de uso del servicio de automatización de facturas BlueBlinq.",
};

const sections = [
  {
    title: "1. Aceptación de los términos",
    body: [
      "Estos Términos y Condiciones (los \"Términos\") regulan el acceso y uso de la plataforma BlueBlinq (el \"Servicio\"), una herramienta de automatización de facturas con inteligencia artificial. Al crear una cuenta o utilizar el Servicio, usted (el \"Usuario\") declara haber leído, comprendido y aceptado estos Términos en su totalidad.",
      "Si no está de acuerdo con estos Términos, le solicitamos que no utilice el Servicio.",
    ],
  },
  {
    title: "2. Descripción del Servicio",
    body: [
      "BlueBlinq permite cargar facturas en formato PDF, imagen o XML y extraer automáticamente sus datos (emisor, RUT, montos e IVA) mediante inteligencia artificial, clasificando el IVA según la normativa vigente en la República Oriental del Uruguay.",
      "El Servicio es una herramienta de asistencia y no sustituye el asesoramiento contable, fiscal o legal profesional. El Usuario es el único responsable de revisar, validar y aprobar la información antes de utilizarla con fines contables o impositivos.",
    ],
  },
  {
    title: "3. Registro y cuenta",
    body: [
      "Para utilizar el Servicio el Usuario debe registrarse proporcionando información veraz, exacta y actualizada. El Usuario es responsable de mantener la confidencialidad de sus credenciales y de toda actividad que ocurra bajo su cuenta.",
      "El Usuario debe notificar de inmediato cualquier uso no autorizado de su cuenta.",
    ],
  },
  {
    title: "4. Uso aceptable",
    body: [
      "El Usuario se compromete a utilizar el Servicio de forma lícita y a no: (i) cargar contenido que no le pertenezca o para el cual no tenga autorización; (ii) intentar vulnerar la seguridad del Servicio; (iii) utilizar el Servicio para fines fraudulentos o contrarios a la ley; ni (iv) interferir con el funcionamiento normal de la plataforma.",
    ],
  },
  {
    title: "5. Precisión de la inteligencia artificial",
    body: [
      "La extracción y clasificación de datos se realiza mediante modelos de inteligencia artificial que, si bien buscan la mayor precisión posible, pueden contener errores o imprecisiones. BlueBlinq no garantiza que los resultados sean completos, exactos o libres de errores.",
      "El Usuario reconoce que es su responsabilidad verificar la totalidad de los datos extraídos antes de su uso, especialmente en lo relativo a montos, RUT y clasificación de IVA.",
    ],
  },
  {
    title: "6. Datos y privacidad",
    body: [
      "Los documentos y datos cargados por el Usuario son procesados con la finalidad de prestar el Servicio. BlueBlinq aplica medidas razonables de seguridad para proteger dicha información, sin perjuicio de lo cual ningún sistema es completamente infalible.",
      "El procesamiento de datos personales se realiza conforme a la Ley N.º 18.331 de Protección de Datos Personales de Uruguay. El Usuario conserva la titularidad de los datos que carga en la plataforma.",
    ],
  },
  {
    title: "7. Propiedad intelectual",
    body: [
      "El Servicio, su software, diseño, marcas y contenidos son propiedad de BlueBlinq o de sus licenciantes y están protegidos por la legislación aplicable. Estos Términos no otorgan al Usuario ningún derecho de propiedad sobre el Servicio, salvo el derecho limitado de uso aquí descrito.",
    ],
  },
  {
    title: "8. Limitación de responsabilidad",
    body: [
      "En la máxima medida permitida por la ley, BlueBlinq no será responsable por daños indirectos, incidentales o consecuentes, ni por pérdidas derivadas de errores en la extracción o clasificación de datos, decisiones contables o impositivas tomadas por el Usuario, o interrupciones del Servicio.",
      "El Servicio se ofrece \"tal cual\" y \"según disponibilidad\".",
    ],
  },
  {
    title: "9. Modificaciones",
    body: [
      "BlueBlinq podrá modificar estos Términos o el Servicio en cualquier momento. Las modificaciones entrarán en vigencia desde su publicación en esta página. El uso continuado del Servicio luego de dichas modificaciones implica su aceptación.",
    ],
  },
  {
    title: "10. Ley aplicable y jurisdicción",
    body: [
      "Estos Términos se rigen por las leyes de la República Oriental del Uruguay. Cualquier controversia se someterá a los tribunales competentes de la ciudad de Montevideo.",
    ],
  },
  {
    title: "11. Contacto",
    body: [
      "Para consultas relacionadas con estos Términos puede comunicarse con nosotros a través de los canales de soporte disponibles en la plataforma.",
    ],
  },
];

export default function TerminosPage() {
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

      {/* ── Nav ──────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-6 max-w-7xl mx-auto w-full shrink-0">
        <Link
          href="/"
          className="text-lg tracking-tight"
          style={{ fontFamily: "'Funnel Sans', sans-serif", fontWeight: 700, color: "#3F6EE8" }}
        >
          BlueBlinq.
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
          style={{ fontFamily: "'Funnel Sans', sans-serif" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </nav>

      {/* ── Content ──────────────────────────────── */}
      <main className="relative z-10 max-w-3xl mx-auto px-8 lg:px-16 py-12 w-full flex-1">
        <h1
          className="mb-3 tracking-tight"
          style={{
            fontFamily: "'Funnel Sans', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
          }}
        >
          Términos y Condiciones
        </h1>
        <p
          className="text-white/30 text-xs mb-12 tracking-widest uppercase"
          style={{ fontFamily: "'Funnel Sans', sans-serif" }}
        >
          Última actualización: julio de 2026
        </p>

        <div className="flex flex-col gap-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2
                className="text-white/90 text-lg mb-3"
                style={{ fontFamily: "'Funnel Sans', sans-serif", fontWeight: 600 }}
              >
                {section.title}
              </h2>
              <div className="flex flex-col gap-3">
                {section.body.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-white/50 text-sm leading-relaxed"
                    style={{ fontFamily: "'Funnel Sans', sans-serif", fontWeight: 300 }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 lg:px-16 py-8 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-sm"
            style={{ fontFamily: "'Funnel Sans', sans-serif", fontWeight: 700, color: "#3F6EE8" }}
          >
            BlueBlinq.
          </Link>
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

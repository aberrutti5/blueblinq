import Link from "next/link";
import { Zap, Upload, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-6 max-w-lg">
        <Zap className="h-16 w-16 text-blue-600 mx-auto" />
        <h1 className="text-4xl font-bold">BlueBlinq</h1>
        <p className="text-gray-600 text-lg">
          Automatizá la extracción y clasificación de tus facturas con
          inteligencia artificial.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/login">
            <Button size="lg">Ingresar</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Registrarse
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-8 text-sm text-gray-500">
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-5 w-5" />
            <span>Subí tu factura</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Zap className="h-5 w-5" />
            <span>IA extrae los datos</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>IVA clasificado</span>
          </div>
        </div>
      </div>
    </div>
  );
}

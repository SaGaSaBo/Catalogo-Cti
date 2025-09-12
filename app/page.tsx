import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8 text-center space-y-6">
      <h1>Catálogo CTI</h1>
      <p className="text-lg text-slate-600">Sistema de gestión de catálogo mayorista</p>
      <div className="flex justify-center gap-4">
        <Link href="/ui-preview"><Button>Ver Componentes UI</Button></Link>
        <Link href="/products"><Button variant="secondary">Ver Productos</Button></Link>
        <Link href="/admin"><Button variant="ghost">Admin</Button></Link>
      </div>
    </main>
  );
}
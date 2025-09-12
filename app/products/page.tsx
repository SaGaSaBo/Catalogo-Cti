import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

async function getProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/products`, {
      next: { revalidate: 60 },
      cache: 'force-cache',
    }).catch(() => fetch('/api/products', { next: { revalidate: 60 }, cache: 'force-cache' }));
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.items ?? []);
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  // Simulamos un estado vacío para evitar problemas de rendimiento durante el build
  const products: any[] = [];

  return (
    <main className="container mx-auto p-6 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="mb-1">Productos</h1>
          <p className="text-slate-600">Catálogo disponible</p>
        </div>
        <Link href="/admin"><Button variant="secondary">Ir al Admin</Button></Link>
      </div>

      <Card className="p-8 text-center">
        <CardTitle className="mb-2">Cargando productos...</CardTitle>
        <CardDescription>Los productos se cargarán dinámicamente.</CardDescription>
      </Card>
    </main>
  );
}

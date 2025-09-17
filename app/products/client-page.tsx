'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  title: string;
  brand: string;
  price: number;
  imagePath?: string;
  imagen?: string;
  image?: string;
  mainImage?: string;
  sku: string;
}

export default function ProductsClientPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products...');
        const response = await fetch('/api/products');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="mb-1">Productos</h1>
            <p className="text-slate-600">Cargando catálogo...</p>
          </div>
          <Link href="/admin"><Button variant="secondary">Ir al Admin</Button></Link>
        </div>
        <Card className="p-8 text-center">
          <CardTitle className="mb-2">Cargando productos...</CardTitle>
          <CardDescription>Por favor espera mientras cargamos el catálogo.</CardDescription>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="mb-1">Productos</h1>
            <p className="text-slate-600">Error al cargar</p>
          </div>
          <Link href="/admin"><Button variant="secondary">Ir al Admin</Button></Link>
        </div>
        <Card className="p-8 text-center">
          <CardTitle className="mb-2 text-red-600">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Reintentar
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="mb-1">Productos</h1>
          <p className="text-slate-600">Catálogo disponible ({products.length} productos)</p>
        </div>
        <Link href="/admin"><Button variant="secondary">Ir al Admin</Button></Link>
      </div>

      {products.length === 0 ? (
        <Card className="p-8 text-center">
          <CardTitle className="mb-2">Sin productos</CardTitle>
          <CardDescription>Agrega productos desde el panel de administración.</CardDescription>
        </Card>
      ) : (
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p: Product) => {
            const name = p.name ?? p.title ?? p.sku ?? "Producto";
            const brand = p.brand ?? "";
            const price = p.price ?? null;
            const imagePath =
              p.imagePath ??
              p.imagen ??
              p.image ??
              p.mainImage ??
              `productos/${p.sku ?? p.id ?? 'item'}/main-800.webp`;
            const pid = p.id ?? p.sku ?? "";

            return (
              <Link key={`${pid}-${name}`} href={`/products/${pid}`} className="group">
                <Card className="overflow-hidden">
                  <SmartImage
                    storagePath={imagePath}
                    alt={name}
                    width={600}
                    height={800}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-3 space-y-1">
                    <CardTitle className="text-base">{name}</CardTitle>
                    <CardDescription>{brand}</CardDescription>
                    {price != null && (
                      <p className="text-sm font-medium text-slate-900">${Number(price).toLocaleString()}</p>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}

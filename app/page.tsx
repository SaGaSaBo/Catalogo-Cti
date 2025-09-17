import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">Catálogo CTI</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Sistema de gestión de catálogo mayorista para productos deportivos y lifestyle
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/products">
            <Button size="lg" className="min-w-[160px]">
              Ver Productos
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="secondary" size="lg" className="min-w-[160px]">
              Panel Admin
            </Button>
          </Link>
          <Link href="/ui-preview">
            <Button variant="outline" size="lg" className="min-w-[160px]">
              Componentes UI
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🛍️ Catálogo Completo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Explora nuestra amplia gama de productos deportivos de las mejores marcas: Nike, Adidas, Puma, Jordan y más.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📱 Fácil Navegación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Interfaz intuitiva y responsive que funciona perfectamente en desktop y móvil.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚡ Gestión Eficiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Panel de administración completo para gestionar productos, categorías y pedidos.
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 rounded-lg p-8 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-slate-900">10+</div>
            <div className="text-sm text-slate-600">Productos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">5</div>
            <div className="text-sm text-slate-600">Categorías</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">8</div>
            <div className="text-sm text-slate-600">Marcas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">24/7</div>
            <div className="text-sm text-slate-600">Disponible</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-4 mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">¿Listo para explorar?</h2>
        <p className="text-slate-600">
          Descubre nuestros productos y comienza a gestionar tu inventario
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/products">
            <Button size="lg">
              Explorar Productos
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" size="lg">
              Acceder Admin
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
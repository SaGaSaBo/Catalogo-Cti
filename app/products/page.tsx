import ProductCatalog from '@/components/ProductCatalog';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-2">Catálogo completo de productos</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ProductCatalog />
      </main>
    </div>
  );
}

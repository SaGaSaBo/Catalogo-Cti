import ProductCatalog from '@/components/ProductCatalog';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Catálogo ALTOCONCEPTO</h1>
          <p className="text-gray-600 mt-2">Catálogo de productos mayoristas</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ProductCatalog />
      </main>
    </div>
  );
}
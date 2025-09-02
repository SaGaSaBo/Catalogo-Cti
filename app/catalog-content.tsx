"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product, Category } from '@/lib/types';
import { FlipbookCatalog } from '@/components/flipbook-catalog';
import { CategoryFilter } from '@/components/category-filter';
import { CartSummary } from '@/components/cart-summary';
import { fetchJson } from '@/lib/fetchJson';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag } from 'lucide-react';

export function CatalogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const categoryId = searchParams.get('category');
    if (categoryId) {
      setSelectedCategoryId(categoryId);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        fetchJson('/api/products'),
        fetchJson('/api/categories')
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    router.push(`/?${params.toString()}`);
  };

  const filteredProducts = selectedCategoryId
    ? products.filter(product => product.categoryId === selectedCategoryId)
    : products;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-8 w-24 mb-4" />
                  <Skeleton className="h-64 w-full rounded-lg mb-4" />
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Catálogo Mayorista
            </h1>
            <p className="text-gray-600">
              Descubre nuestra amplia gama de productos de calidad
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Catálogo de Productos</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Explora nuestra colección completa de productos
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">
                {filteredProducts.length} productos
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Filtros activos:</strong> {selectedCategoryId ? 
                    categories.find(c => c.id === selectedCategoryId)?.name || 'Categoría seleccionada' : 
                    'Todos los productos'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold">Carrito de Compras</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Gestiona tus productos seleccionados
              </p>
              <div className="text-2xl font-bold text-green-600 mb-4">
                Listo para pedir
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Funcionalidad:</strong> Agrega productos al carrito y genera tu pedido en PDF
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        <FlipbookCatalog products={filteredProducts} />

        <div className="mt-12">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}

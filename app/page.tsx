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

export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Get page from URL params
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category');
    setCurrentPage(Math.max(1, page));
    setSelectedCategoryId(category);
  }, [searchParams]);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchJson('/api/products'),
          fetchJson('/api/categories')
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar el catálogo';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products by category
  const filteredProducts = selectedCategoryId 
    ? products.filter(product => product.categoryId === selectedCategoryId)
    : products;

  // Calculate product counts per category
  const productCounts = categories.reduce((counts, category) => {
    counts[category.id] = products.filter(p => p.categoryId === category.id).length;
    return counts;
  }, {} as Record<string, number>);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (selectedCategoryId) {
      params.set('category', selectedCategoryId);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (categoryId) {
      params.set('category', categoryId);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-32 sm:pb-16">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Catálogo Mayorista</h1>
            </div>
            <p className="text-lg text-gray-600">
              Descubre nuestra colección exclusiva de prendas de alta calidad
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Category Filter */}
        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={handleCategorySelect}
            productCounts={productCounts}
          />
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {selectedCategoryId ? 'No hay productos en esta categoría' : 'No hay productos disponibles'}
            </h3>
            <p className="text-gray-500">
              {selectedCategoryId ? 'Prueba seleccionando otra categoría.' : 'El catálogo está vacío en este momento.'}
            </p>
          </div>
        ) : (
          <FlipbookCatalog 
            products={filteredProducts}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Cart Summary */}
      <CartSummary products={products} />
    </div>
  );
}
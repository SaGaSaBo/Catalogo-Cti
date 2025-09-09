"use client";

import { useState, useEffect } from 'react';
import { useCartContext } from '@/context/cart-context';
import { toast } from 'sonner';
import { ACHeader, CategoryChips, SearchBox, ProductCard } from '@/components/ui';
import { CartModal } from '@/components/cart-modal';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getTotalUnits } = useCartContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);

        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error('Error en las APIs');
        }

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función de búsqueda
  const searchProducts = (products: any[], term: string) => {
    if (!term.trim()) return products;
    
    const searchTermLower = term.toLowerCase().trim();
    return products.filter((product: any) => {
      return (
        product.title?.toLowerCase().includes(searchTermLower) ||
        product.brand?.toLowerCase().includes(searchTermLower) ||
        product.sku?.toLowerCase().includes(searchTermLower) ||
        product.description?.toLowerCase().includes(searchTermLower)
      );
    });
  };

  // Filtrado combinado por categoría y búsqueda
  const getFilteredProducts = () => {
    let filtered = selectedCategory === 'all' 
      ? products 
      : products.filter((product: any) => product.categoryId === selectedCategory);
    
    return searchProducts(filtered, searchTerm);
  };

  const filteredProducts = getFilteredProducts();

  // Preparar categorías para CategoryChips
  const categoryChips = [
    'Todas las categorías',
    ...categories.map((cat: any) => cat.name)
  ];

  const getActiveCategoryIndex = () => {
    if (selectedCategory === 'all') return 0;
    const categoryIndex = categories.findIndex((cat: any) => cat.id === selectedCategory);
    return categoryIndex + 1; // +1 porque "Todas las categorías" está en índice 0
  };

  const handleCategoryChange = (index: number) => {
    if (index === 0) {
      setSelectedCategory('all');
    } else {
      const category = categories[index - 1];
      setSelectedCategory(category?.id || 'all');
    }
  };

  // Función para manejar el QuickAdd del modal
  const handleQuickAdd = (payload: {
    productId: string;
    quantities: Record<string, number>;
    units: number;
    amount: number;
  }) => {
    // Aquí puedes integrar con tu hook de carrito existente
    console.log('🛒 Producto agregado al carrito:', payload);
    toast.success(`Se agregaron ${payload.units} unidades por $${payload.amount.toLocaleString('es-AR')}`);
  };

  // Función para agregar directo al carrito
  const handleAddToCart = (product: any) => {
    console.log('🛒 Agregar directo al carrito:', product.title);
    toast.success(`Agregado al carrito: ${product.title}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Error al cargar el catálogo</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con nuevo design system */}
      <ACHeader 
        title="ALTOCONCEPTO"
        subtitle="Mayorista"
        cartCount={getTotalUnits()}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-6 space-y-6">
        {/* Barra de búsqueda con nuevo design system */}
        <SearchBox 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          placeholder="Buscar por nombre, marca o SKU…"
        />

        {/* Filtros de categoría con nuevo design system */}
        <CategoryChips 
          items={categoryChips}
          activeIndex={getActiveCategoryIndex()}
          onChange={handleCategoryChange}
        />

        {/* Indicador de resultados de búsqueda */}
        {searchTerm && (
          <div className="text-center">
            <p className="text-gray-600">
              {filteredProducts.length > 0 
                ? `Mostrando ${filteredProducts.length} resultado(s) para "${searchTerm}"`
                : `No se encontraron productos para "${searchTerm}"`
              }
            </p>
          </div>
        )}

        {/* Grid de productos con nuevo design system */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product: any) => (
            <ProductCard
              key={product.id}
              productId={product.id}
              imageUrl={product.imageUrls?.[0]}
              images={product.imageUrls || []}
              title={product.title}
              brand={product.brand}
              sku={product.sku}
              price={product.price}
              sizes={product.sizes || []}
              onQuickAdd={handleQuickAdd}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>

        {/* Estado vacío */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `No hay productos que coincidan con "${searchTerm}"`
                : 'Intenta con otra categoría o vuelve más tarde.'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modal del Carrito */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        products={products}
      />
    </div>
  );
}
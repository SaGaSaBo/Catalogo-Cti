"use client";

import { useState, useEffect } from 'react';
import { useCartContext } from '@/context/cart-context';
import { toast } from 'sonner';
import { ProductGallery } from '@/components/product-gallery';
import { CartModal } from '@/components/cart-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, Search, X, Check } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { updateQuantity, getQuantity, getTotalUnits } = useCartContext();

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleExpandProduct = (product: any) => {
    setExpandedProduct(product);
  };

  const handleCloseExpanded = () => {
    setExpandedProduct(null);
  };

  const handleConfirmSelection = () => {
    const hasItems = expandedProduct.sizes.some((size: string) => 
      getQuantity(expandedProduct.id, size) > 0
    );
    
    if (hasItems) {
      toast.success('Productos agregados al carrito');
      setExpandedProduct(null);
    } else {
      toast.info('Selecciona al menos una talla y cantidad');
    }
  };

  const handleQuantityChange = (productId: string, size: string, newQuantity: number) => {
    updateQuantity(productId, size, newQuantity);
    if (newQuantity > 0) {
      toast.success(`${newQuantity} unidades de talla ${size} agregadas`);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Catálogo CTI</h1>
              <p className="text-gray-600 mt-1">Productos de calidad para tu negocio</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {filteredProducts.length} productos
              </div>
              <Button 
                variant="outline" 
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Carrito
                {getTotalUnits() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                    {getTotalUnits()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de Búsqueda */}
        <div className="mb-6">
          <div className="max-w-md mx-auto relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por nombre, marca o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-3 w-full text-base"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros de Categoría */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todas las categorías
            </button>
            {categories.map((category: any) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* Botón para limpiar filtros */}
          {(searchTerm || selectedCategory !== 'all') && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-sm"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Indicador de resultados de búsqueda */}
        {searchTerm && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              {filteredProducts.length > 0 
                ? `Mostrando ${filteredProducts.length} resultado(s) para "${searchTerm}"`
                : `No se encontraron productos para "${searchTerm}"`
              }
            </p>
          </div>
        )}

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              {/* Imagen del producto con carrusel */}
              <div className="aspect-square">
                <ProductGallery 
                  images={product.imageUrls || []} 
                  title={product.title} 
                />
              </div>

              {/* Información del producto */}
              <div className="p-6">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {product.sizes?.slice(0, 4).map((size: string, index: number) => (
                      <span
                        key={`${size}-${index}`}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {size}
                      </span>
                    ))}
                    {product.sizes?.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{product.sizes.length - 4} más
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleExpandProduct(product)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
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
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Producto Expandido */}
      {expandedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{expandedProduct.title}</h2>
                  <p className="text-gray-600">{expandedProduct.brand}</p>
                </div>
                <button
                  onClick={handleCloseExpanded}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Imagen del producto */}
                <div>
                  <ProductGallery 
                    images={expandedProduct.imageUrls || []} 
                    title={expandedProduct.title} 
                  />
                </div>

                {/* Información del producto */}
                <div>
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {formatPrice(expandedProduct.price)}
                    </p>
                    <p className="text-gray-600 mb-4">{expandedProduct.description}</p>
                    <p className="text-sm text-gray-500">SKU: {expandedProduct.sku}</p>
                  </div>

                  {/* Selección de tallas y cantidades */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Selecciona tallas y cantidades:</h3>
                    
                    {/* Grid de tallas en 2-3 líneas */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                      {expandedProduct.sizes.map((size: string, index: number) => {
                        const currentQuantity = getQuantity(expandedProduct.id, size);
                        return (
                          <div key={`${size}-${index}`} className="border border-gray-200 rounded-lg p-3">
                            <div className="text-center mb-2">
                              <span className="font-medium text-gray-700 text-sm">{size}</span>
                            </div>
                            <div className="flex items-center justify-center space-x-1 mb-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(expandedProduct.id, size, currentQuantity - 1)}
                                disabled={currentQuantity <= 0}
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                value={currentQuantity}
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value) || 0;
                                  handleQuantityChange(expandedProduct.id, size, newQuantity);
                                }}
                                className="w-12 h-6 text-center text-xs [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                min="0"
                                max="999"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(expandedProduct.id, size, currentQuantity + 1)}
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            {currentQuantity > 0 && (
                              <div className="text-center">
                                <Badge variant="secondary" className="text-xs">
                                  {currentQuantity}
                                </Badge>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Botón OK para confirmar selección */}
                    <div className="flex justify-center">
                      <Button
                        onClick={handleConfirmSelection}
                        className="flex items-center gap-2 px-6"
                        size="lg"
                      >
                        <Check className="h-4 w-4" />
                        OK - Confirmar Selección
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal del Carrito */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        products={products}
      />
    </div>
  );
}

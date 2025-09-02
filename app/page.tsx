"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

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

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter((product: any) => product.categoryId === selectedCategory);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleExpandProduct = (product: any) => {
    setExpandedProduct(product);
    setSelectedSize('');
    setQuantity(1);
  };

  const handleCloseExpanded = () => {
    setExpandedProduct(null);
    setSelectedSize('');
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!expandedProduct || !selectedSize) {
      toast.error('Por favor selecciona una talla');
      return;
    }

    addToCart({
      id: `${expandedProduct.id}-${selectedSize}`,
      productId: expandedProduct.id,
      title: expandedProduct.title,
      brand: expandedProduct.brand,
      price: expandedProduct.price,
      size: selectedSize,
      quantity,
      imageUrl: expandedProduct.imageUrls[0] || '/images/placeholder-image.svg'
    });

    toast.success(`${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} agregada${quantity === 1 ? '' : 's'} al carrito`);
    handleCloseExpanded();
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
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
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
        {/* Filtros de Categorías */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Todos los productos ({products.length})
            </button>
            {categories.map((category: any) => {
              const categoryCount = products.filter((p: any) => p.categoryId === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category.name} ({categoryCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              {/* Imagen del producto */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <img
                    src={product.imageUrls[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder-image.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Información del producto */}
              <div className="p-6">
                <div className="mb-2">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {product.brand}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  SKU: {product.sku}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                </div>

                {/* Tallas disponibles */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Tallas disponibles:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.slice(0, 6).map((size: string) => (
                        <span
                          key={size}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {size}
                        </span>
                      ))}
                      {product.sizes.length > 6 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          +{product.sizes.length - 6}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Botón de acción */}
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

        {/* Modal expandido del producto */}
        {expandedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header del modal */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Seleccionar Producto</h2>
                  <button
                    onClick={handleCloseExpanded}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Imagen del producto */}
                  <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                      {expandedProduct.imageUrls && expandedProduct.imageUrls.length > 0 ? (
                        <img
                          src={expandedProduct.imageUrls[0]}
                          alt={expandedProduct.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder-image.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {expandedProduct.brand}
                        </span>
                        <span className="text-sm text-gray-600">SKU: {expandedProduct.sku}</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {expandedProduct.title}
                      </h3>
                      
                      <div className="text-3xl font-bold text-green-600 mb-6">
                        {formatPrice(expandedProduct.price)}
                      </div>
                    </div>

                    {/* Descripción */}
                    {expandedProduct.description && (
                      <div>
                        <h4 className="text-lg font-semibold mb-2">Descripción</h4>
                        <p className="text-gray-600 leading-relaxed">
                          {expandedProduct.description}
                        </p>
                      </div>
                    )}

                    {/* Selección de talla */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Selecciona tu talla</h4>
                      <div className="grid grid-cols-6 gap-2 mb-4">
                        {expandedProduct.sizes.map((size: string) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`h-12 px-3 rounded-lg border-2 font-medium transition-colors ${
                              selectedSize === size
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      {!selectedSize && (
                        <p className="text-sm text-red-600">Por favor selecciona una talla</p>
                      )}
                    </div>

                    {/* Cantidad */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Cantidad</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                            className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="px-4 py-2 min-w-[3rem] text-center border-x">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-3 py-2 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm text-gray-600">
                          {quantity} {quantity === 1 ? 'unidad' : 'unidades'}
                        </span>
                      </div>
                    </div>

                    {/* Total y botón */}
                    <div className="space-y-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total:</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatPrice(expandedProduct.price * quantity)}
                        </p>
                      </div>
                      
                      <button 
                        onClick={handleAddToCart}
                        disabled={!selectedSize}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Agregar al Carrito
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje si no hay productos */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos en esta categoría</h3>
            <p className="text-gray-600">Intenta seleccionar otra categoría o ver todos los productos.</p>
          </div>
        )}


      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingCart, Package, Star } from 'lucide-react';
import { useCart } from '@/store/cart';
import { toast } from 'sonner';
import ProductGallery from '@/components/ProductGallery';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) {
          throw new Error('Producto no encontrado');
        }
        const productData = await response.json();
        setProduct(productData);
        
        // Seleccionar la primera talla disponible por defecto
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el producto');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize) {
      toast.error('Por favor selecciona una talla');
      return;
    }

    addItem({
      productId: product.id,
      name: product.title,
      size: selectedSize,
      price: product.price,
      qty: quantity,
      sku: product.sku,
      image: product.imageUrls[0] || '/images/placeholder-image.svg'
    });

    toast.success(`${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} agregada${quantity === 1 ? '' : 's'} al carrito`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || 'Producto no encontrado'}</p>
            <Button onClick={() => router.back()} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al catálogo
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes del producto */}
          <div className="space-y-4">
            <ProductGallery 
              images={product.imageUrls || []} 
              alt={product.title}
              className="w-full"
            />
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {product.brand}
                </Badge>
                <Badge variant="outline">
                  SKU: {product.sku}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8) - 124 reseñas</span>
              </div>

              <div className="text-4xl font-bold text-green-600 mb-6">
                {formatPrice(product.price)}
              </div>
            </div>

            <Separator />

            {/* Descripción */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Selección de talla */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Selecciona tu talla</h3>
              <div className="grid grid-cols-6 gap-2 mb-4">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    className="h-12"
                  >
                    {size}
                  </Button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-sm text-red-600">Por favor selecciona una talla</p>
              )}
            </div>

            <Separator />

            {/* Cantidad */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Cantidad</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  {quantity} {quantity === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>
            </div>

            <Separator />

            {/* Botón de agregar al carrito */}
            <div className="space-y-4">
              <Button 
                onClick={handleAddToCart}
                disabled={!selectedSize}
                size="lg"
                className="w-full h-14 text-lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Agregar al Carrito
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-semibold text-lg text-green-600">
                    {formatPrice(product.price * quantity)}
                  </span>
                </p>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Información del producto</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Envío gratuito en compras superiores a $50.000</li>
                <li>• Devolución gratuita hasta 30 días</li>
                <li>• Garantía de calidad del fabricante</li>
                <li>• Stock disponible en todas las tallas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

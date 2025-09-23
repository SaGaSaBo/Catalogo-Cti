"use client";

import { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react';

interface AdminProductManagerProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleActive: (product: Product) => void;
  isLoading: boolean;
}



export function AdminProductManager({ 
  products, 
  categories, 
  onEdit,
  onDelete,
  onToggleActive,
  isLoading
}: AdminProductManagerProps) {
  
  // Ensure arrays are always arrays
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  // Obtener moneda
  const rawCurrency = process.env.NEXT_PUBLIC_CURRENCY || 'CLP';
  const currencyMap: Record<string, string> = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    'CLP': 'CLP'
  };
  const currency = currencyMap[rawCurrency] || rawCurrency;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
          <p className="text-gray-600 mt-1">Administra todos los productos del catálogo</p>
        </div>
      </div>

      {safeProducts.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No hay productos creados
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza creando tu primer producto para el catálogo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeProducts.map((product) => (
            <Card key={product.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={product.active ? "default" : "secondary"}>
                      {product.active ? (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Inactivo
                        </>
                      )}
                    </Badge>
                    {product.categoryId && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {safeCategories.find(c => c.id === product.categoryId)?.name || 'Sin categoría'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(product)}
                      title="Editar producto"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleActive(product)}
                      title={product.active ? "Desactivar" : "Activar"}
                    >
                      {product.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="text-red-600 hover:text-red-700 px-2 py-1 rounded-md border border-red-200 hover:bg-red-50 text-sm"
                      title="Eliminar producto"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <CardTitle className="text-lg">{product.title}</CardTitle>
                <CardDescription>Producto del catálogo</CardDescription>
                <div className="mt-1 space-y-1">
                  <Badge variant="secondary">{product.brand}</Badge>
                  <div className="text-sm">SKU: {product.sku}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold text-lg text-blue-600">
                    {currency} {product.price}
                  </p>
                  <p className="text-sm text-gray-600">
                    Talles: {product.sizes.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Imágenes: {product.imageUrls.length}
                  </p>
                  {product.imageUrls.length > 0 && (
                    <div className="mt-2">
                      <img 
                        src={product.imageUrls[0]} 
                        alt={product.title}
                        className="w-full h-32 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-image.svg';
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from 'react';
import { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchJson } from '@/lib/fetchJson';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff, Package, GripVertical } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AdminProductManagerProps {
  products: Product[];
  categories: Category[];
  onProductsChange: () => void;
  onEditProduct: (product: Product) => void;
  onCreateProduct: () => void;
  adminKey: string;
}

interface DraggableProductCardProps {
  product: Product;
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  currency: string;
}

function DraggableProductCard({ product, categories, onEdit, onDelete, currency }: DraggableProductCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const category = categories.find(c => c.id === product.categoryId);

  return (
    <Card ref={setNodeRef} style={style} className={`relative ${isDragging ? 'z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
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
            {category && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {category.name}
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
              onClick={() => onDelete(product.id)}
              title="Eliminar producto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
                  e.currentTarget.src = '/placeholder-image.svg';
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface CategoryDropZoneProps {
  category: Category | null;
  products: Product[];
  categories: Category[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  currency: string;
}

function CategoryDropZone({ category, products, categories, onEditProduct, onDeleteProduct, currency }: CategoryDropZoneProps) {
  const categoryProducts = products.filter(p => 
    category ? p.categoryId === category.id : !p.categoryId
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Package className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold text-gray-700">
          {category ? category.name : 'Sin Categoría'}
        </h3>
        <Badge variant="secondary">
          {categoryProducts.length} productos
        </Badge>
      </div>
      
      <SortableContext items={categoryProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryProducts.map((product) => (
            <DraggableProductCard
              key={product.id}
              product={product}
              categories={categories}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
              currency={currency}
            />
          ))}
        </div>
      </SortableContext>
      
      {categoryProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No hay productos en esta categoría</p>
          <p className="text-sm">Arrastra productos aquí para asignarlos</p>
        </div>
      )}
    </div>
  );
}

export function AdminProductManager({ 
  products, 
  categories, 
  onProductsChange, 
  onEditProduct, 
  onCreateProduct,
  adminKey 
}: AdminProductManagerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Obtener moneda y mapear símbolos a códigos ISO
  const rawCurrency = process.env.NEXT_PUBLIC_CURRENCY || 'CLP';
  const currencyMap: Record<string, string> = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    'CLP': 'CLP'
  };
  const currency = currencyMap[rawCurrency] || rawCurrency;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const productId = active.id as string;
    const overId = over.id as string;

    // Determine target category
    let targetCategoryId: string | undefined;
    
    if (overId.startsWith('category-')) {
      targetCategoryId = overId.replace('category-', '') || undefined;
    } else {
      // Dropped on another product, find its category
      const targetProduct = products.find(p => p.id === overId);
      targetCategoryId = targetProduct?.categoryId;
    }

    // Update product category
    try {
      await fetchJson(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({
          ...products.find(p => p.id === productId),
          categoryId: targetCategoryId
        }),
      });

      toast.success('Producto movido a nueva categoría');
      onProductsChange();
    } catch (error) {
      console.error('Error updating product category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al mover producto: ${errorMessage}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (!confirm(`¿Estás seguro de que deseas eliminar "${product.title}"?`)) {
      return;
    }

    try {
      await fetchJson(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });

      toast.success('Producto eliminado');
      onProductsChange();
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al eliminar producto: ${errorMessage}`);
    }
  };

  const activeProduct = activeId ? products.find(p => p.id === activeId) : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
          <p className="text-gray-600 mt-1">Arrastra productos entre categorías para organizarlos</p>
        </div>
        <Button onClick={onCreateProduct} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-8">
          {/* Uncategorized products */}
          <CategoryDropZone
            category={null}
            products={products}
            categories={categories}
            onEditProduct={onEditProduct}
            onDeleteProduct={handleDeleteProduct}
            currency={currency}
          />

          {/* Categorized products */}
          {categories.map((category) => (
            <CategoryDropZone
              key={category.id}
              category={category}
              products={products}
              categories={categories}
              onEditProduct={onEditProduct}
              onDeleteProduct={handleDeleteProduct}
              currency={currency}
            />
          ))}
        </div>

        <DragOverlay>
          {activeProduct ? (
            <DraggableProductCard
              product={activeProduct}
              categories={categories}
              onEdit={() => {}}
              onDelete={() => {}}
              currency={currency}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {products.length === 0 && (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No hay productos creados
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza creando tu primer producto para el catálogo.
          </p>
          <Button onClick={onCreateProduct} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Producto
          </Button>
        </div>
      )}
    </div>
  );
}
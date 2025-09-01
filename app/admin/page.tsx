"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AdminCategoryManager } from '@/components/admin-category-manager';
import { AdminProductManager } from '@/components/admin-product-manager';
import { ImageUpload } from '@/components/image-upload';
import { fetchJson } from '@/lib/fetchJson';
import { toast } from 'sonner';
import { Save, X, Settings } from 'lucide-react';

export default function AdminPage() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSortIndex, setCurrentSortIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    brand: '',
    title: '',
    description: '',
    sku: '',
    price: '',
    sizes: '',
    imageUrls: ['', '', '', ''],
    active: true,
    categoryId: undefined as string | undefined
  });

  const adminKey = searchParams.get('key') || 'admin123';

  useEffect(() => {
    if (adminKey === 'admin123') {
      setIsAuthenticated(true);
      fetchData();
    } else if (adminKey && adminKey !== 'admin123') {
      // Si hay una clave pero no es válida, mostrar error
      toast.error('Clave de administrador inválida');
    }
    setIsInitializing(false);
  }, [adminKey]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        fetchJson('/api/products', {
          headers: { 'Authorization': `Bearer ${adminKey}` }
        }),
        fetchJson('/api/categories', {
          headers: { 'Authorization': `Bearer ${adminKey}` }
        }).catch((error) => {
          console.warn('Error loading categories, continuing without them:', error);
          return [];
        })
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al cargar datos: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = () => fetchData();
  const fetchCategories = () => fetchData();

  const getNextSortIndex = () => {
    if (!products || products.length === 0) return 1;
    const maxIndex = Math.max(
      ...products.map(p => typeof p.sortIndex === 'number' ? p.sortIndex : 0)
    );
    return maxIndex + 1;
  };

  const handleSave = async () => {
    try {
      // Validaciones del frontend
      if (!formData.brand.trim() || !formData.title.trim() || !formData.sku.trim() || !formData.price.trim()) {
        toast.error('Por favor completa todos los campos obligatorios');
        return;
      }

      // Validar máximo 4 imágenes
      const validImageUrls = formData.imageUrls.filter(url => url.trim() !== '');
      if (validImageUrls.length > 4) {
        toast.error('Máximo 4 imágenes permitidas');
        return;
      }

      if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        toast.error('El precio debe ser un número válido mayor a 0');
        return;
      }

      if (!formData.sizes.trim()) {
        toast.error('Por favor especifica al menos un talle');
        return;
      }

      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products';

      const requestBody = {
        ...formData,
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        imageUrls: formData.imageUrls.filter(url => url.trim() !== ''),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s !== ''),
        sortIndex: editingProduct
          ? (typeof currentSortIndex === 'number' ? currentSortIndex : editingProduct.sortIndex ?? getNextSortIndex())
          : getNextSortIndex(),
        categoryId: formData.categoryId ?? undefined
      };

      await fetchJson(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify(requestBody),
      });

      toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado');
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar producto';
      toast.error(errorMessage);
    }
  };

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setCurrentSortIndex(typeof product.sortIndex === 'number' ? product.sortIndex : null);
      setFormData({
        brand: product.brand,
        title: product.title,
        description: product.description || '',
        sku: product.sku,
        price: product.price.toString(),
        sizes: product.sizes.join(', '),
        imageUrls: [...product.imageUrls, ...Array(4 - product.imageUrls.length).fill('')],
        active: product.active,
        categoryId: product.categoryId ? String(product.categoryId) : undefined
      });
    } else {
      setEditingProduct(null);
      setCurrentSortIndex(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      brand: '',
      title: '',
      description: '',
      sku: '',
      price: '',
      sizes: '',
      imageUrls: ['', '', '', ''],
      active: true,
      categoryId: undefined
    });
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setCurrentSortIndex(null);
    resetForm();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso no autorizado</CardTitle>
            <CardDescription>
              {adminKey ? 
                'La clave proporcionada no es válida.' : 
                'Necesitas una clave válida para acceder al panel de administración.'
              }
              <br />
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                /admin?key=TU_CLAVE_ADMIN
              </code>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600 mt-2">Gestiona el catálogo de productos</p>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-500">Admin Panel</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Cargando datos...</div>
        ) : (
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">Categorías</TabsTrigger>
              <TabsTrigger value="products">Productos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories">
              <AdminCategoryManager
                categories={categories}
                onCategoriesChange={fetchCategories}
                adminKey={adminKey || ''}
              />
            </TabsContent>
            
            <TabsContent value="products">
              <AdminProductManager
                products={products}
                categories={categories}
                onProductsChange={fetchProducts}
                onEditProduct={openDialog}
                onCreateProduct={() => openDialog()}
                adminKey={adminKey || ''}
              />
            </TabsContent>
          </Tabs>
        )}

        <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </DialogTitle>
              <DialogDescription>
                Complete todos los campos para {editingProduct ? 'actualizar' : 'crear'} el producto.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Marca *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ej: Guarnieri"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Ej: AC-BOL-001"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Traje Bolonia"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción detallada del producto..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="149.99"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sizes">Talles (separados por coma) *</Label>
                <Input
                  id="sizes"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="S, M, L, XL"
                  required
                />
              </div>

              <div>
                <ImageUpload
                  images={formData.imageUrls.filter(url => url.trim() !== '')}
                  onImagesChange={(newImages) => {
                    const paddedImages = [...newImages, ...Array(4 - newImages.length).fill('')];
                    setFormData({ ...formData, imageUrls: paddedImages.slice(0, 4) });
                  }}
                  maxImages={4}
                  label="Imágenes del producto"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Producto activo</Label>
              </div>

              <div>
                <Label htmlFor="order">Orden (opcional)</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={currentSortIndex ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCurrentSortIndex(v === '' ? null : Math.max(1, Number(v)));
                  }}
                  placeholder="1, 2, 3..."
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Si lo dejas vacío, se asigna automáticamente.
                </p>
              </div>

              <div>
                <Label htmlFor="category">Categoría (opcional)</Label>
                <Select
                  value={formData.categoryId ?? ""}
                  onValueChange={(v) => {
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: v === "__none__" ? undefined : v,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin categoría</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
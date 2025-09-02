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

export function AdminPageContent() {
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

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        brand: product.brand,
        title: product.title,
        description: product.description,
        sku: product.sku,
        price: product.price.toString(),
        sizes: product.sizes.join(', '),
        imageUrls: [...product.imageUrls, '', '', ''].slice(0, 4),
        active: product.active,
        categoryId: product.categoryId
      });
      setCurrentSortIndex(product.sortIndex);
    } else {
      setEditingProduct(null);
      resetForm();
      setCurrentSortIndex(null);
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setCurrentSortIndex(null);
    resetForm();
  };

  const handleSave = async () => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
        imageUrls: formData.imageUrls.filter(url => url.trim()),
        sortIndex: currentSortIndex || (products.length + 1)
      };

      if (editingProduct) {
        await fetchJson(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminKey}`
          },
          body: JSON.stringify(productData)
        });
        toast.success('Producto actualizado correctamente');
      } else {
        await fetchJson('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminKey}`
          },
          body: JSON.stringify(productData)
        });
        toast.success('Producto creado correctamente');
      }

      await fetchData();
      closeDialog();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      await fetchJson(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });
      toast.success('Producto eliminado correctamente');
      await fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await fetchJson(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({ ...product, active: !product.active })
      });
      toast.success(`Producto ${!product.active ? 'activado' : 'desactivado'} correctamente`);
      await fetchData();
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Error al cambiar el estado del producto');
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600 mt-2">Gestiona productos y categorías</p>
            </div>
            <Button onClick={() => openDialog()}>
              <Settings className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Productos ({products.length})</TabsTrigger>
            <TabsTrigger value="categories">Categorías ({categories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <AdminProductManager
              products={products}
              categories={categories}
              onEdit={openDialog}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="categories">
            <AdminCategoryManager
              categories={categories}
              onCategoriesChange={fetchData}
              adminKey={adminKey}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Modifica los datos del producto' : 'Completa la información del nuevo producto'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Ej: Florenzi"
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Código del producto"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nombre del producto"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción detallada del producto"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.categoryId || ''}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value === '__none__' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
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

            <div>
              <Label htmlFor="sizes">Tallas (separadas por comas)</Label>
              <Input
                id="sizes"
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                placeholder="S, M, L, XL"
              />
            </div>

            <div>
              <Label>Imágenes</Label>
              <ImageUpload
                images={formData.imageUrls}
                onImagesChange={(urls) => setFormData({ ...formData, imageUrls: urls })}
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
  );
}

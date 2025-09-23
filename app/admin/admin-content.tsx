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
import { AdminOrdersManager } from '@/components/admin-orders-manager';
import { ImageUpload } from '@/components/image-upload';
import { fetchJson } from '@/lib/fetchJson';
import { toast } from 'sonner';
import { Save, X, Settings } from 'lucide-react';
import { ADMIN_SECRET } from '@/lib/admin-config';

export function AdminPageContent() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSortIndex, setCurrentSortIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    brand: '',
    title: '',
    description: '',
    sku: '',
    price: '',
    sizes: '',
    imageUrls: [] as string[],
    active: true,
    categoryId: undefined as string | undefined
  });

  const adminKey = searchParams.get('key') || 'admin123';

  // Función para eliminar producto usando el endpoint server-side
  async function deleteProduct(productId: string) {
    const res = await fetch("/api/admin/delete-product", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify({ id: productId }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Error al eliminar");
  }

  useEffect(() => {
    const initializeAdmin = async () => {
      console.log('🔧 Inicializando admin con key:', adminKey);
      try {
        if (adminKey === 'admin123') {
          console.log('✅ Clave válida, autenticando...');
          setIsAuthenticated(true);
          console.log('📡 Cargando datos...');
          await fetchData();
          console.log('✅ Datos cargados exitosamente');
        } else if (adminKey && adminKey !== 'admin123') {
          console.log('❌ Clave inválida');
          toast.error('Clave de administrador inválida');
        } else {
          console.log('⚠️ Sin clave de admin');
        }
      } catch (error) {
        console.error('❌ Error initializing admin:', error);
        toast.error('Error al inicializar el panel de administración');
      } finally {
        console.log('🏁 Finalizando inicialización');
        setIsInitializing(false);
      }
    };

    initializeAdmin();
  }, [adminKey]);

  const fetchData = async () => {
    console.log('📡 Iniciando fetchData...');
    setIsLoading(true);
    try {
      console.log('🔄 Haciendo requests a APIs...');
      const [productsData, categoriesData] = await Promise.all([
        fetchJson('/api/products', {
          headers: {
            'Authorization': `Bearer ${adminKey}`
          }
        }),
        fetchJson('/api/categories', {
          headers: {
            'Authorization': `Bearer ${adminKey}`
          }
        })
      ]);
      console.log('📦 Productos recibidos:', productsData?.length || 0);
      console.log('📂 Categorías recibidas:', categoriesData?.length || 0);
      console.log('📂 Categorías data:', categoriesData);
      
      // Handle new API response format
      const products = productsData?.items || productsData || [];
      const categories = categoriesData || [];
      
      setProducts(products);
      setCategories(categories);
      console.log('✅ fetchData completado exitosamente');
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
      console.log('🏁 fetchData finalizado');
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
      imageUrls: [] as string[],
      active: true,
      categoryId: undefined
    });
  };

  const openDialog = (product?: Product) => {
    console.log('Opening dialog with product:', product);
    if (product) {
      setEditingProduct(product);
      const formDataToSet = {
        brand: product.brand,
        title: product.title,
        description: product.description || '',
        sku: product.sku,
        price: product.price.toString(),
        sizes: product.sizes?.join(', ') || '',
        imageUrls: product.imageUrls?.filter(url => url && url.trim()) || [],
        active: product.active,
        categoryId: product.categoryId
      };
      console.log('Setting form data:', formDataToSet);
      setFormData(formDataToSet);
      setCurrentSortIndex(product.sortIndex);
    } else {
      setEditingProduct(null);
      resetForm();
      setCurrentSortIndex(null);
    }
    setIsDialogOpen(true);
  };

  const handlePendingOrdersChange = (count: number) => {
    setPendingOrdersCount(count);
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
        imageUrls: formData.imageUrls?.filter(url => url.trim()) || [],
        sortIndex: currentSortIndex || ((Array.isArray(products) ? products.length : 0) + 1)
      };

      console.log('Saving product data:', productData);
      console.log('Editing product:', editingProduct);

      if (editingProduct) {
        console.log('Updating product with ID:', editingProduct.id);
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
        console.log('Creating new product');
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
    console.log('Attempting to delete product with ID:', productId);
    
    // Encontrar el producto para obtener sus datos
    const product = products.find(p => p.id === productId);
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }

    if (!confirm(`¿Eliminar "${product.title || product.brand || 'este producto'}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      console.log('Deleting product with server-side endpoint:', productId);
      await deleteProduct(productId);
      
      toast.success('Producto eliminado correctamente');
      await fetchData(); // Recargar la lista
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('No se pudo eliminar: ' + (error?.message ?? 'Error desconocido'));
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

  // Log para depuración de categorías
  console.log('🔍 Renderizando selector de categorías. Categorías disponibles:', categories);

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Productos ({Array.isArray(products) ? products.length : 0})</TabsTrigger>
            <TabsTrigger value="categories">Categorías ({Array.isArray(categories) ? categories.length : 0})</TabsTrigger>
            <TabsTrigger value="orders" className="relative">
              Pedidos
              {pendingOrdersCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                  {pendingOrdersCount}
                </Badge>
              )}
            </TabsTrigger>
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

          <TabsContent value="orders">
            <AdminOrdersManager adminKey={adminKey} onPendingOrdersChange={handlePendingOrdersChange} />
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
            <div className="grid grid-cols-3 gap-4">
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

            <div className="grid grid-cols-3 gap-4">
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
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__loading__" disabled>
                        Cargando categorías...
                      </SelectItem>
                    )}
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
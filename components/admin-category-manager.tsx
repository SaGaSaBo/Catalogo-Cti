"use client";

import { useState } from 'react';
import { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { fetchJson } from '@/lib/fetchJson';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X, Tag } from 'lucide-react';

interface AdminCategoryManagerProps {
  categories: Category[];
  onCategoriesChange: () => void;
  adminKey: string;
}

export function AdminCategoryManager({ categories, onCategoriesChange, adminKey }: AdminCategoryManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';

      await fetchJson(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({ name: categoryName.trim() }),
      });

      toast.success(editingCategory ? 'Categoría actualizada' : 'Categoría creada');
      closeDialog();
      onCategoriesChange();
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar categoría';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${name}"? Los productos asignados a esta categoría quedarán sin categoría.`)) {
      return;
    }

    try {
      await fetchJson(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });

      toast.success('Categoría eliminada');
      onCategoriesChange();
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al eliminar categoría: ${errorMessage}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h2>
          <p className="text-gray-600 mt-1">Organiza tus productos por categorías</p>
        </div>
        <Button onClick={() => openDialog()} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Crear Categoría
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No hay categorías creadas
          </h3>
          <p className="text-gray-500 mb-6">
            Crea tu primera categoría para organizar los productos.
          </p>
          <Button onClick={() => openDialog()} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Crear Primera Categoría
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    Categoría
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDialog(category)}
                      title="Editar categoría"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(category.id, category.name)}
                      title="Eliminar categoría"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription>ID: {category.id}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Modifica el nombre de la categoría.' : 'Ingresa el nombre de la nueva categoría.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div>
              <Label htmlFor="categoryName">Nombre de la Categoría *</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ej: Camisas, Pantalones, Accesorios"
                required
              />
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
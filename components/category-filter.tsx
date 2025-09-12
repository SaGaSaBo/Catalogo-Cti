"use client";

import { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  productCounts: Record<string, number>;
}

export function CategoryFilter({ 
  categories, 
  selectedCategoryId, 
  onCategorySelect,
  productCounts 
}: CategoryFilterProps) {
  const totalProducts = Object.values(productCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrar por Categoría</h3>
      <div className="flex flex-wrap gap-3">
        <Button
          variant={selectedCategoryId === null ? "primary" : "outline"}
          onClick={() => onCategorySelect(null)}
          className="flex items-center gap-2"
        >
          Todos los productos
          <Badge variant="secondary" className="ml-1">
            {totalProducts}
          </Badge>
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategoryId === category.id ? "primary" : "outline"}
            onClick={() => onCategorySelect(category.id)}
            className="flex items-center gap-2"
          >
            {category.name}
            <Badge variant="secondary" className="ml-1">
              {productCounts[category.id] || 0}
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );
}
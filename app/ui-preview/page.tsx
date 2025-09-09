"use client";

import React, { useMemo, useState } from "react";
import { ACHeader, CategoryChips } from "@/components/ui";
import { SearchBox } from "@/components/ui";
import { ProductCard, ProductCardProps } from "@/components/ui";

const demoCategories = [
  "Todas las categorías",
  "Camisas Basic",
  "Trajes Florenzi",
  "Camisas Cotton Blend",
  "Ternos",
];

const demoProducts: ProductCardProps[] = [
  {
    productId: "demo-1",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594938298605-c63c6e57b7c5?q=80&w=800&auto=format&fit=crop"
    ],
    title: "Basic Negra",
    brand: "Florenzi",
    sku: "FCMAPCL5248NE00L",
    price: 12490,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    productId: "demo-2",
    imageUrl:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop"
    ],
    title: "AMBO MINIMAT FLORENZI",
    brand: "Florenzi",
    sku: "AMFLORENZIMINIMAT",
    price: 49990,
    sizes: ["44", "46", "48", "50", "52"],
  },
  {
    productId: "demo-3",
    imageUrl: "",
    images: [],
    title: "Terno Eleganza",
    brand: "Guarnieri",
    sku: "TRN-ELG-001",
    price: 149900,
    sizes: ["46", "48", "50"],
  },
];

export default function Page() {
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return demoProducts.filter((p) =>
      q ? [p.title, p.brand, p.sku].some((v) => (v || "").toLowerCase().includes(q)) : true
    );
  }, [query]);

  // Función de ejemplo para manejar la confirmación del modal
  const handleQuickAdd = (payload: {
    productId: string;
    quantities: Record<string, number>;
    units: number;
    amount: number;
  }) => {
    console.log("🛒 Producto agregado al carrito:", payload);
    alert(`Se agregaron ${payload.units} unidades por $${payload.amount.toLocaleString('es-AR')}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ACHeader cartCount={3} />

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-6 space-y-6">
        <SearchBox value={query} onChange={(e) => setQuery(e.currentTarget.value)} />

        <CategoryChips items={demoCategories} activeIndex={active} onChange={setActive} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <ProductCard 
              key={i} 
              {...p} 
              onQuickAdd={handleQuickAdd}
              onAddToCart={() => {
                console.log("🛒 Agregar directo al carrito:", p.title);
                alert(`Agregado al carrito: ${p.title}`);
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

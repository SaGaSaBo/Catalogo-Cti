"use client";
import { useState, useMemo } from "react";
import UiImg from "@/components/UiImg";
import { useCart } from "@/store/cart";
import ProductGallery from "@/components/ProductGallery";

export type Product = {
  id: string;
  name: string;
  brand?: string;
  price: number;
  sku?: string;
  images?: string[];
  sizes?: string[]; // ["S","M","L","XL"]
};

export default function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [qtyBySize, setQtyBySize] = useState<Record<string, number>>({});
  const cart = useCart();

  const totalSel = useMemo(
    () => Object.values(qtyBySize).reduce((a, b) => a + (b || 0), 0),
    [qtyBySize]
  );

  const inc = (size: string) =>
    setQtyBySize((m) => ({ ...m, [size]: (m[size] || 0) + 1 }));
  const dec = (size: string) =>
    setQtyBySize((m) => ({ ...m, [size]: Math.max(0, (m[size] || 0) - 1) }));

  const handleAdd = () => {
    const entries = Object.entries(qtyBySize).filter(([, q]) => q > 0);
    if (!entries.length) return;
    
    // Verificar que el store esté hidratado y addItem esté disponible
    if (!cart._hasHydrated || !cart.addItem || typeof cart.addItem !== 'function') {
      console.error('Cart not ready:', { 
        hasHydrated: cart._hasHydrated, 
        addItem: cart.addItem 
      });
      return;
    }
    
    for (const [size, qty] of entries) {
      cart.addItem({
        productId: product.id,
        name: product.name,
        size,
        price: product.price,
        qty,
        sku: product.sku,
        image: product.images?.[0],
      });
    }
    setQtyBySize({});
    setOpen(false);
  };

  return (
    <>
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border">
          {product.images?.[0] ? (
            <UiImg
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className="object-cover"
              loading="lazy"
              priority={false}
              widthHint={400}
              qualityHint={70}
              format="webp"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Sin imagen</span>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col gap-2">
          <div className="text-lg font-semibold leading-tight">{product.name}</div>
          {product.brand && <div className="text-gray-500 text-sm">{product.brand}</div>}
          <div className="mt-auto flex items-center justify-between">
            <div className="font-bold">${product.price.toLocaleString("es-CL")}</div>
            {product.sku && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{product.sku}</span>}
          </div>
          <button
            onClick={() => setOpen(true)}
            className="mt-3 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Ver producto
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] isolate">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative mx-auto mt-20 w-full max-w-3xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Cerrar">✕</button>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ProductGallery 
                    images={product.images || []} 
                    alt={product.name}
                    className="w-full"
                  />

                  <div className="space-y-5">
                    <div className="text-2xl font-bold">${product.price.toLocaleString("es-CL")}</div>

                    {product.sizes?.length ? (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">Talles (selecciona cantidades)</div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {product.sizes.map((size) => (
                            <div key={size} className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2">
                              <span className="text-sm">{size}</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => dec(size)} className="w-8 h-8 rounded-lg border hover:bg-gray-50">−</button>
                                <span className="w-8 text-center">{qtyBySize[size] || 0}</span>
                                <button onClick={() => inc(size)} className="w-8 h-8 rounded-lg border hover:bg-gray-50">+</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Este producto no tiene talles cargados.</div>
                    )}

                    <button
                      disabled={totalSel === 0 || !cart._hasHydrated}
                      onClick={handleAdd}
                      className="w-full rounded-xl bg-gray-900 text-white py-2 font-medium hover:bg-black disabled:opacity-50 disabled:hover:bg-gray-900"
                    >
                      {!cart._hasHydrated ? "Cargando..." : `Agregar al carrito ${totalSel > 0 ? `(${totalSel})` : ""}`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
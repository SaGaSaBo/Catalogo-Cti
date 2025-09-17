import { useState } from "react";

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

  return (
    <>
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          <span className="text-sm text-gray-400">Imagen del producto 400x400</span>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-2">
          <div className="text-lg font-semibold leading-tight">{product.name}</div>
          {product.brand && <div className="text-gray-500 text-sm">{product.brand}</div>}
          <div className="mt-auto flex items-center justify-between">
            <div className="font-bold">${product.price.toLocaleString("es-CL")}</div>
            {product.sku && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                {product.sku}
              </span>
            )}
          </div>

          {/* Botón visible para abrir el modal */}
          <button
            onClick={() => setOpen(true)}
            className="mt-3 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Ver producto
          </button>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] isolate" role="dialog" aria-modal="true">
          {/* Backdrop opaco */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          {/* Card */}
          <div className="relative mx-auto mt-20 w-full max-w-3xl p-4">
            <div className="rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-2 hover:bg-gray-100"
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {/* Si hay imágenes, renderiza la primera. Mantén el placeholder si no hay. */}
                    <span className="text-sm text-gray-400">Imagen</span>
                  </div>

                  <div className="space-y-4">
                    <div className="text-2xl font-bold">
                      ${product.price.toLocaleString("es-CL")}
                    </div>

                    {product.sizes?.length ? (
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Talles</div>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((t) => (
                            <span key={t} className="rounded-xl border px-3 py-1 text-sm">{t}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Este producto no tiene talles cargados.</div>
                    )}

                    <button
                      className="w-full rounded-xl bg-gray-900 text-white py-2 font-medium hover:bg-black"
                      onClick={() => setOpen(false)}
                    >
                      Seleccionar
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

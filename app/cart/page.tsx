"use client";
import Image from "next/image";
import { useCart, useCartTotal } from "@/store/cart";

export default function CartPage() {
  const { items, setQty, removeItem, clear } = useCart();
  const total = useCartTotal();

  const copyOrder = async () => {
    const lines = items.map(i => `${i.name} ${i.size ?? ""} x${i.qty} — $${(i.price).toLocaleString("es-CL")} c/u`);
    lines.push(`\nTOTAL: $${total.toLocaleString("es-CL")}`);
    await navigator.clipboard.writeText(lines.join("\n"));
    alert("Pedido copiado al portapapeles.");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Carrito</h1>

      {items.length === 0 ? (
        <div className="text-gray-500">Tu carrito está vacío.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {items.map((it) => (
              <div key={it.key} className="flex items-center gap-4 rounded-xl border p-4">
                <div className="size-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {it.image ? (
                    <Image src={it.image} alt={it.name} width={64} height={64} />
                  ) : (
                    <span className="text-xs text-gray-400">400x400</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-gray-600">
                    {it.sku ? `${it.sku} · ` : ""}{it.size ? `Talle ${it.size}` : "Sin talle"}
                  </div>
                </div>
                <div className="w-32 text-right">
                  <div className="font-medium">${it.price.toLocaleString("es-CL")}</div>
                  <div className="text-xs text-gray-500">c/u</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(it.key, it.qty - 1)} className="w-8 h-8 rounded-lg border hover:bg-gray-50">−</button>
                  <span className="w-8 text-center">{it.qty}</span>
                  <button onClick={() => setQty(it.key, it.qty + 1)} className="w-8 h-8 rounded-lg border hover:bg-gray-50">+</button>
                </div>
                <div className="w-28 text-right font-semibold">
                  ${(it.qty * it.price).toLocaleString("es-CL")}
                </div>
                <button onClick={() => removeItem(it.key)} className="text-red-600 hover:text-red-700 text-sm">
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button onClick={clear} className="text-sm rounded-lg border px-3 py-2 hover:bg-gray-50">
              Vaciar carrito
            </button>
            <div className="text-xl font-bold">Total: ${total.toLocaleString("es-CL")}</div>
          </div>

          <div className="mt-4 flex gap-3 justify-end">
            <button onClick={copyOrder} className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:bg-gray-900">
              Copiar pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
}

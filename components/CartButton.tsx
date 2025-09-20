"use client";
import { useEffect, useState } from "react";
import { useCart, useCartCount } from "@/store/cart";
import { CartModal } from "@/components/cart-modal";

export default function CartButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cart = useCart();
  const count = useCartCount();

  // Manejar hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // No renderizar hasta que esté montado y hidratado
  if (!mounted || !cart._hasHydrated) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        data-cart-button
        data-owner="ac"
        className="fixed bottom-6 right-6 z-[100] rounded-full shadow-lg bg-black text-white px-5 py-3 text-sm font-medium hover:bg-gray-900 transition-colors"
      >
        Ver Carrito{count > 0 ? ` (${count})` : ""}
      </button>
      
      <CartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={[]} // El modal obtiene los productos del store
      />
    </>
  );
}

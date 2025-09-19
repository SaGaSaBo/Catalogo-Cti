"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCartCount } from "@/store/cart";

declare global {
  interface Window { __acCartBtnMounted?: boolean }
}

export default function CartButton() {
  // ✅ Singleton guard (solo cliente)
  const skip = useRef(false);
  if (typeof window !== "undefined") {
    if (window.__acCartBtnMounted) {
      // Ya hay un botón montado → no renderizar este
      skip.current = true;
    } else {
      window.__acCartBtnMounted = true;
    }
  }
  useEffect(() => {
    return () => {
      // Si este fue el que marcó el flag, al desmontar lo liberamos
      if (typeof window !== "undefined" && !document.querySelector('[data-cart-button]:not([data-owner="ac"])')) {
        window.__acCartBtnMounted = false;
      }
    };
  }, []);

  const count = useCartCount();

  if (skip.current) return null;

  return (
    <Link
      href="/cart"
      // data-* para auditar con DevTools (Elements → buscar [data-cart-button])
      data-cart-button
      data-owner="ac"
      className="fixed bottom-6 right-6 z-[100] rounded-full shadow-lg bg-black text-white px-5 py-3 text-sm font-medium hover:bg-gray-900"
    >
      Ver Carrito{count ? ` (${count})` : ""}
    </Link>
  );
}

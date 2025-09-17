"use client";
import Link from "next/link";
import { useCartCount } from "@/store/cart";

export default function CartButton() {
  const count = useCartCount();
  return (
    <Link
      href="/cart"
      className="fixed bottom-6 right-6 rounded-full shadow-lg bg-black text-white px-5 py-3 text-sm font-medium hover:bg-gray-900"
    >
      Carrito ({count})
    </Link>
  );
}

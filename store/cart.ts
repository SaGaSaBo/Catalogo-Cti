"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  key: string;         // productId + size
  productId: string;
  name: string;
  size?: string;
  price: number;
  qty: number;
  sku?: string;
  image?: string;
};

type AddInput = Omit<CartItem, "key">;

type CartState = {
  items: CartItem[];
  addItem: (i: AddInput) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (i) => {
        const key = `${i.productId}__${i.size ?? "UNQ"}`;
        const items = get().items.slice();
        const idx = items.findIndex((x) => x.key === key);
        if (idx >= 0) {
          items[idx] = { ...items[idx], qty: items[idx].qty + i.qty };
        } else {
          items.push({ ...i, key });
        }
        set({ items });
      },
      setQty: (key, qty) => {
        set((s) => ({
          items: s.items.map((it) => (it.key === key ? { ...it, qty: Math.max(0, qty) } : it)).filter((it) => it.qty > 0),
        }));
      },
      removeItem: (key) => set((s) => ({ items: s.items.filter((it) => it.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "ac-cart",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

export const useCartCount = () =>
  useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));

export const useCartTotal = () =>
  useCart((s) => s.items.reduce((a, i) => a + i.qty * i.price, 0));

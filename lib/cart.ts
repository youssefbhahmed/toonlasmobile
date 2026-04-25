import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalCartItem {
  product_id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
}

interface CartState {
  items: LocalCartItem[];
  add: (item: LocalCartItem) => void;
  update: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.product_id === item.product_id);
          if (existing) {
            const newQty = Math.min(existing.quantity + item.quantity, item.stock);
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id ? { ...i, quantity: newQty } : i,
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(item.quantity, item.stock) }],
          };
        }),
      update: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.product_id === productId
                ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product_id !== productId) })),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((s, i) => s + Number(i.price) * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    {
      name: 'toon-cart',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  email: string;
  role: 'customer' | 'admin';
  name: string;
  department: string;
  designation?: string;
  phone?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'snacks' | 'beverages' | 'sweets';
  imageUrl?: string;
  available: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

interface CartState {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => {
        set({ user });
        // Clear cart when switching users
        if (user) {
          const currentUserId = useAuthStore.getState().user?.id;
          if (currentUserId !== user.id) {
            useCartStore.getState().clearCart();
          }
        }
      },
      logout: () => {
        set({ user: null });
        // Clear cart on logout
        useCartStore.getState().clearCart();
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (menuItem, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((item) => item.menuItem.id === menuItem.id);
        
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.menuItem.id === menuItem.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { menuItem, quantity }] });
        }
      },
      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.menuItem.id !== itemId) });
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
        } else {
          set({
            items: get().items.map((item) =>
              item.menuItem.id === itemId ? { ...item, quantity } : item
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.menuItem.price * item.quantity,
          0
        );
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: () => {
        const user = useAuthStore.getState().user;
        return user ? `cart-storage-${user.id}` : 'cart-storage-guest';
      },
    }
  )
);

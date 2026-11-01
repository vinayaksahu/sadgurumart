'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  title: string;
  slug: string;
  mrp: number;
  dpPrice: number;
  pv: number;
  bv: number;
  image?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalMrp: number;
  totalDp: number;
  totalSavings: number;
  totalPV: number;
  totalBV: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('sgm_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('sgm_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to persist cart to localStorage', e);
      }
    }
  }, [items, mounted]);

  const addToCart = (product: any, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          slug: product.slug,
          mrp: product.mrp,
          dpPrice: product.dpPrice,
          pv: product.pv,
          bv: product.bv,
          image: product.images?.[0] || '/sgm_logo.png',
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalMrp = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const totalDp = items.reduce((sum, item) => sum + item.dpPrice * item.quantity, 0);
  const totalSavings = Math.max(0, totalMrp - totalDp);
  const totalPV = items.reduce((sum, item) => sum + item.pv * item.quantity, 0);
  const totalBV = items.reduce((sum, item) => sum + item.bv * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        totalMrp,
        totalDp,
        totalSavings,
        totalPV,
        totalBV,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

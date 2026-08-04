import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Product } from '../types/content';

export interface CartLine {
  id: string;
  name: string;
  metal: string;
  price: string;
  image: string;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  wishlist: string[];
  isOpen: boolean;
  count: number;
  totalLabel: string;
  addItem: (product: Product, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleWishlist: (id: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function priceToNumber(price: string): number {
  const digits = price.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

export function CartProvider({ children }: {children: React.ReactNode;}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: Product, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.id === product.id);
      if (existing) {
        return prev.map((line) => line.id === product.id ? { ...line, qty: line.qty + qty } : line);
      }
      return [
      ...prev,
      {
        id: product.id,
        name: product.name,
        metal: product.metal,
        price: product.price,
        image: product.image,
        qty
      }];

    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
    qty <= 0 ?
    prev.filter((line) => line.id !== id) :
    prev.map((line) => line.id === id ? { ...line, qty } : line)
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  }, []);

  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const total = lines.reduce((sum, line) => sum + priceToNumber(line.price) * line.qty, 0);
  const totalLabel = `₹${total.toLocaleString('en-IN')}`;

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      wishlist,
      isOpen,
      count,
      totalLabel,
      addItem,
      setQty,
      removeItem,
      clear,
      openCart,
      closeCart,
      toggleWishlist
    }),
    [
    lines,
    wishlist,
    isOpen,
    count,
    totalLabel,
    addItem,
    setQty,
    removeItem,
    clear,
    openCart,
    closeCart,
    toggleWishlist]

  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside a CartProvider');
  return ctx;
}
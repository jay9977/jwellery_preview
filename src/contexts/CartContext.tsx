import React, { useCallback, useMemo, useState } from 'react';
import { CartContext, type CartContextValue, type CartLine } from './cart-context';
import type { Product } from '../types/content';

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


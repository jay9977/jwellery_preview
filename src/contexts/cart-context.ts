import { createContext } from 'react';
import type { Product } from '../types/content';

export interface CartLine {
  id: string;
  name: string;
  metal: string;
  price: string;
  image: string;
  qty: number;
}

export interface CartContextValue {
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

/**
 * Kept out of the provider file so that file only exports a component — which is
 * what Fast Refresh needs to hot-reload the provider without losing cart state.
 */
export const CartContext = createContext<CartContextValue | null>(null);

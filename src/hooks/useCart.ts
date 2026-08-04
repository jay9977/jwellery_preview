import { useContext } from 'react';
import { CartContext, type CartContextValue } from '../contexts/cart-context';

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside a CartProvider');
  return ctx;
}

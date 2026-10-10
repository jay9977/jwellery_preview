import { createContext, useContext, useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { Motion, Shape } from '../../../data/templates';
import type { FeaturedSection, Product } from '../../../types/content';
import { onQuickView, startEnquiry } from '../../../utils/events';
import { trackLead } from '../../../utils/leads';

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
const VIEW = { once: true, margin: '-80px' } as const;

export const TemplateContext = createContext<{motion: Motion;shape: Shape;}>({ motion: 'fade', shape: 'sharp' });
export const useTemplate = () => useContext(TemplateContext);

const HIDDEN: Record<Motion, Record<string, string | number>> = {
  fade: { opacity: 0, transform: 'translateY(18px)' },
  curtain: { opacity: 0, transform: 'translateY(24px)' },
  zoom: { opacity: 0, transform: 'scale(0.94)' },
  slide: { opacity: 0, transform: 'translateX(-36px)' },
  blur: { opacity: 0, transform: 'translateY(14px)', filter: 'blur(10px)' }
};
const SHOWN: Record<Motion, Record<string, string | number>> = {
  fade: { opacity: 1, transform: 'translateY(0px)' },
  curtain: { opacity: 1, transform: 'translateY(0px)' },
  zoom: { opacity: 1, transform: 'scale(1)' },
  slide: { opacity: 1, transform: 'translateX(0px)' },
  blur: { opacity: 1, transform: 'translateY(0px)', filter: 'blur(0px)' }
};

/** Scroll-in for text and cards, in the template's motion style. Fires once. */
export function useEnter(delay = 0) {
  const { motion } = useTemplate();
  const reduce = useReducedMotion();
  return {
    initial: reduce ? { opacity: 0 } : HIDDEN[motion],
    whileInView: reduce ? { opacity: 1 } : SHOWN[motion],
    viewport: VIEW,
    transition: { duration: motion === 'fade' ? 0.7 : 0.9, ease: EASE_OUT, delay }
  };
}

/** Scroll-in for photographs: a curtain opening for 'curtain', otherwise the template's entry. */
export function useMedia(delay = 0) {
  const { motion } = useTemplate();
  const reduce = useReducedMotion();
  const enter = useEnter(delay);
  if (reduce || motion !== 'curtain') return enter;
  return {
    initial: { clipPath: 'inset(0 50% 0 50%)' },
    whileInView: { clipPath: 'inset(0 0% 0 0%)' },
    viewport: VIEW,
    transition: { duration: 1.1, ease: EASE_IN_OUT, delay }
  };
}

/** Quick view + enquiry behaviour every product layout shares. */
export function useProducts(data: FeaturedSection) {
  const [quickView, setQuickView] = useState<Product | null>(null);
  useEffect(
    () =>
    onQuickView((productId) => {
      const match = data.items.find((item) => item.id === productId);
      if (match) setQuickView(match);
    }),
    [data.items]
  );
  return {
    quickView,
    close: () => setQuickView(null),
    open(product: Product) {
      setQuickView(product);
      trackLead('quick-view', product.name, { interest: product.name });
    },
    enquire(product: Product) {
      trackLead('enquiry', product.name, { interest: product.name });
      startEnquiry(product.name);
    }
  };
}

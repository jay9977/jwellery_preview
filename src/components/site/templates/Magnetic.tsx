import { useRef, type ReactNode } from 'react';

/**
 * Pulls its child a little toward the pointer, then eases it home on leave.
 * Desktop pointers only — touch and reduced-motion users get a still button.
 * The transform is written straight onto the wrapper, never through React state.
 */
export function Magnetic({ children, strength = 0.28 }: {children: ReactNode;strength?: number;}) {
  const ref = useRef<HTMLSpanElement>(null);
  const enabled = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <span
      ref={ref}
      className="tpl-magnetic"
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || !enabled()) return;
        const box = el.getBoundingClientRect();
        const x = (e.clientX - (box.left + box.width / 2)) * strength;
        const y = (e.clientY - (box.top + box.height / 2)) * strength;
        el.setAttribute('data-active', '');
        el.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onPointerLeave={() => {
        const el = ref.current;
        if (!el) return;
        el.removeAttribute('data-active');
        el.style.transform = '';
      }}>

      {children}
    </span>);

}

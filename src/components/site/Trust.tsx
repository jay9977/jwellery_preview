import React from 'react';
import {
  AwardIcon,
  GemIcon,
  HeadphonesIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  TruckIcon } from
'lucide-react';
import type { IconKey, TrustSection } from '../../types/content';

const ICONS: Record<IconKey, React.ComponentType<{className?: string;}>> = {
  gem: GemIcon,
  truck: TruckIcon,
  shield: ShieldCheckIcon,
  refresh: RefreshCwIcon,
  award: AwardIcon,
  headset: HeadphonesIcon
};

export function Trust({ data }: {data: TrustSection;}) {
  return (
    <section id="trust" className="section-y-sm w-full border-y border-ink/10 bg-cream">
      <div className="shell">
        {data.title &&
        <h2 className="display display-3 text-center text-ink">{data.title}</h2>
        }
        <div
          className={`grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 ${
          data.title ? 'mt-10' : ''}`
          }>
          
          {data.items.map((item) => {
            const Icon = ICONS[item.icon] ?? GemIcon;
            return (
              <div key={item.id} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold/40 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="pt-1">
                  <h3 className="meta text-ink">{item.title}</h3>
                  <p className="body-sm mt-2 text-ink/60">{item.text}</p>
                </div>
              </div>);

          })}
        </div>
      </div>
    </section>);

}
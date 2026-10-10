import type { CSSProperties, ReactNode } from 'react';
import { CheckIcon } from 'lucide-react';
import { PALETTES } from '../../data/palettes';
import { TEMPLATES, type HeroLayout, type TemplateDef } from '../../data/templates';
import type { TemplateId, ThemeColors } from '../../types/content';

const RADIUS: Record<TemplateDef['shape'], string> = {
  sharp: '0px',
  soft: '5px',
  round: '12px',
  arch: '999px 999px 0 0'
};

/** A thumbnail of the template's hero, painted in real colours — enough to tell them apart. */
function Sketch({ t, c }: {t: TemplateDef;c: ThemeColors;}) {
  const bg = t.mode === 'dark' ? c.ink : c.cream;
  const fg = t.mode === 'dark' ? c.cream : c.ink;
  const tile = t.mode === 'dark' ? `${c.gold}55` : c.sand;
  const r = RADIUS[t.shape];
  const box = (style: CSSProperties, key?: number | string) =>
  <span key={key} className="absolute" style={{ background: tile, borderRadius: r, ...style }} />;
  const bar = (w: string, h = 4, color = fg, extra: CSSProperties = {}) =>
  <span className="block rounded-full" style={{ width: w, height: h, background: color, opacity: 0.85, ...extra }} />;
  const text =
  <div className="flex w-full flex-col items-center gap-1">
      {bar('22%', 2, c.gold)}
      {bar('55%', 5)}
    </div>;


  const heroes: Record<HeroLayout, ReactNode> = {
    card:
    <>
        {box({ inset: 0, borderRadius: 0 })}
        <div className="absolute bottom-2 left-2 flex w-16 flex-col gap-1 p-1.5" style={{ background: bg }}>
          {bar('70%', 2, c.gold)}
          {bar('100%')}
        </div>
      </>,
    center:
    <>
        {box({ inset: 0, borderRadius: 0, background: `linear-gradient(${tile}, ${bg})` })}
        <div className="absolute inset-0 flex items-center">{text}</div>
      </>,
    split:
    <>
        <div className="absolute left-2 top-1/2 flex w-[45%] -translate-y-1/2 flex-col gap-1">{bar('40%', 2, c.gold)}{bar('95%', 5)}{bar('70%', 5)}</div>
        {box({ right: 8, top: 8, bottom: 8, width: '40%' })}
        <span className="absolute bottom-3 right-[38%] h-5 w-5 rounded-full border-2" style={{ background: c.gold, borderColor: bg }} />
      </>,
    collage:
    <>
        {box({ left: 8, top: 8, width: 26, height: 34, transform: 'rotate(-7deg)' })}
        {box({ right: 8, top: 6, width: 22, height: 30, transform: 'rotate(6deg)', background: c.gold, opacity: 0.6 })}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">{text}</div>
      </>,
    'story-orbit':
    <>
        <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed" style={{ borderColor: c.gold }} />
        {box({ left: '50%', top: '50%', width: 22, height: 28, transform: 'translate(-50%,-50%)', background: c.gold, opacity: 0.8 })}
        {[0, 90, 180, 270].map((d) =>
      <span key={d} className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full" style={{ background: tile, transform: `translate(-50%,-50%) rotate(${d}deg) translateY(-30px)` }} />
      )}
      </>,
    'story-fan':
    <>
        {[-2, -1, 0, 1, 2].map((i) =>
      box({ left: '50%', top: '22%', width: 20, height: 28, transformOrigin: '50% 140%', transform: `translateX(-50%) rotate(${i * 14}deg)`, background: i === 0 ? c.gold : tile }, i)
      )}
      </>,
    'story-rail':
    <>
        {[0, 1, 2, 3, 4].map((i) => box({ left: 6 + i * 30, top: i % 2 ? 22 : 14, width: 24, height: 24, background: i === 2 ? c.gold : tile }, i))}
      </>,
    marquee:
    <>
        <div className="absolute inset-x-0 top-3">{text}</div>
        <div className="absolute inset-x-[-10px] bottom-2 flex -rotate-6 gap-1">{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className="h-6 w-8 shrink-0" style={{ background: tile, borderRadius: r === RADIUS.arch ? 2 : r }} />)}</div>
      </>,
    spotlight:
    <>
        <span className="absolute inset-0" style={{ background: `radial-gradient(circle at 68% 45%, ${c.gold}66, transparent 55%)` }} />
        <span className="absolute right-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full" style={{ background: tile, boxShadow: `0 0 18px ${c.gold}` }} />
        <div className="absolute left-2 top-1/2 flex w-[42%] -translate-y-1/2 flex-col gap-1">{bar('40%', 2, c.gold)}{bar('95%', 5)}</div>
      </>,
    bento:
    <div className="absolute inset-1.5 grid grid-cols-4 grid-rows-2 gap-1">
        <span className="col-span-2 row-span-2 flex flex-col justify-end gap-1 p-1.5" style={{ background: tile, borderRadius: r === RADIUS.arch ? 3 : r }}>{bar('80%', 4)}{bar('50%', 2, c.gold)}</span>
        {[0, 1, 2, 3].map((i) => <span key={i} style={{ background: i === 1 ? c.gold : tile, opacity: i === 1 ? 0.6 : 1, borderRadius: r === RADIUS.arch ? 3 : r }} />)}
      </div>,
    zoom:
    <>
        {box({ left: '36%', right: '36%', top: '22%', bottom: '22%' })}
        <span className="absolute left-2 top-1/2 -translate-y-1/2">{bar('28px', 5)}</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2">{bar('28px', 5)}</span>
        <span className="absolute inset-[14%] border border-dashed" style={{ borderColor: c.gold }} />
      </>,
    columns:
    <>
        <div className="absolute left-2 top-1/2 flex w-[42%] -translate-y-1/2 flex-col gap-1">{bar('40%', 2, c.gold)}{bar('95%', 5)}{bar('65%', 5)}</div>
        {[0, 1, 2].map((col) =>
      <div key={col} className="absolute bottom-0 top-0 flex flex-col gap-1" style={{ right: 6 + col * 18, width: 15, marginTop: col === 1 ? -8 : 0 }}>
            {[0, 1, 2, 3].map((i) => <span key={i} className="h-5 w-full shrink-0" style={{ background: tile, borderRadius: r === RADIUS.arch ? 3 : r }} />)}
          </div>
      )}
      </>,
    coverflow:
    <>
        <div className="absolute inset-x-0 top-2">{bar('45%', 4, fg, { margin: '0 auto' })}</div>
        {[-2, -1, 0, 1, 2].map((i) =>
      box({ left: `calc(50% + ${i * 26}px)`, top: '38%', width: 20, height: 28, transform: `translateX(-50%) perspective(80px) rotateY(${-i * 28}deg) scale(${1 - Math.abs(i) * 0.12})`, background: i === 0 ? c.gold : tile }, i)
      )}
      </>
  };

  return (
    <div className="relative h-full overflow-hidden" style={{ background: bg }}>
      {heroes[t.layout.hero]}
      {t.header === 'pill' &&
      <span className="absolute left-1/2 top-1 h-2 w-3/4 -translate-x-1/2 rounded-full" style={{ background: `${fg}22` }} />
      }
    </div>);

}

export function TemplatePicker({
  value,
  colors,
  onChange



}: {value: TemplateId;colors?: ThemeColors;onChange: (id: TemplateId) => void;}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {TEMPLATES.map((t) => {
        const active = t.id === value;
        // Each card is painted in its own suggested colours, the look you get by choosing it.
        const c = colors && t.id === 'original' ? colors : (PALETTES.find((p) => p.id === t.palette) ?? PALETTES[0]).colors;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-pressed={active}
            className={`group relative overflow-hidden rounded-lg border text-left transition-[border-color,box-shadow,transform] duration-200 ${
            active ? 'border-[#b8913f] ring-2 ring-[#b8913f]/25' : 'border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'}`
            }>

            <div className="h-24 overflow-hidden">
              <Sketch t={t} c={c} />
            </div>
            <div className="border-t border-slate-100 bg-white p-2.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                {t.name}
                {active && <CheckIcon className="h-3.5 w-3.5 text-[#a8823a]" />}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">{t.description}</p>
              {t.id !== 'original' &&
              <p className="mt-1.5 flex flex-wrap gap-1">
                  {[t.layout.hero.replace('story-', ''), `${t.header} nav`, t.mode, t.hover].map((tag) =>
                <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-500">
                      {tag}
                    </span>
                )}
                </p>
              }
            </div>
          </button>);

      })}
    </div>);

}

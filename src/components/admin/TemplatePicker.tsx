import { CheckIcon } from 'lucide-react';
import { PALETTES } from '../../data/palettes';
import { TEMPLATES, type TemplateDef } from '../../data/templates';
import type { TemplateId, ThemeColors } from '../../types/content';

const RADIUS: Record<TemplateDef['shape'], string> = {
  sharp: '0px',
  soft: '6px',
  round: '14px',
  arch: '999px 999px 0 0'
};

/** A thumbnail of the template's hero and first row, painted in real colours. */
function Sketch({ t, c }: {t: TemplateDef;c: ThemeColors;}) {
  const bg = t.mode === 'dark' ? c.ink : c.cream;
  const fg = t.mode === 'dark' ? c.cream : c.ink;
  const tile = t.mode === 'dark' ? `${c.gold}40` : c.sand;
  const r = RADIUS[t.shape];
  const line = (w: string, h = 4, color = fg) =>
  <span className="block rounded-full" style={{ width: w, height: h, background: color, opacity: color === fg ? 0.85 : 1 }} />;

  const hero = {
    story:
    <div className="relative flex h-full items-center justify-center" style={{ background: `radial-gradient(circle, ${tile}, ${bg} 70%)` }}>
        <span className="absolute h-16 w-16 rounded-full border border-dashed" style={{ borderColor: c.gold }} />
        <span className="h-9 w-7 shadow" style={{ background: c.gold, opacity: 0.85, borderRadius: r === RADIUS.arch ? r : r === '0px' ? 0 : 6 }} />
        {t.intro === 'rail' ?
      <>
            <span className="absolute left-3 h-4 w-4" style={{ background: tile, borderRadius: r === RADIUS.arch ? 2 : r }} />
            <span className="absolute right-3 h-4 w-4" style={{ background: tile, borderRadius: r === RADIUS.arch ? 2 : r }} />
          </> :
      t.intro === 'fan' ?
      <>
            <span className="absolute h-8 w-6 -translate-x-5 -rotate-12" style={{ background: tile, borderRadius: 3 }} />
            <span className="absolute h-8 w-6 translate-x-5 rotate-12" style={{ background: tile, borderRadius: 3 }} />
          </> :
      [0, 90, 180, 270].map((deg) =>
      <span
        key={deg}
        className="absolute h-3 w-3 rounded-full"
        style={{ background: tile, transform: `rotate(${deg}deg) translateY(-26px)` }} />

      )}
      </div>,
    card:
    <div className="relative h-full" style={{ background: tile }}>
        <div className="absolute bottom-2 left-2 flex w-16 flex-col gap-1 p-1.5" style={{ background: bg, borderRadius: r === RADIUS.arch ? 2 : r }}>
          {line('70%', 3, c.gold)}
          {line('100%')}
          {line('60%')}
        </div>
      </div>,
    center:
    <div className="flex h-full flex-col items-center justify-center gap-1.5" style={{ background: `linear-gradient(${tile}, ${bg})` }}>
        {line('22%', 3, c.gold)}
        {line('55%', 5)}
        <span className="mt-0.5 h-2.5 w-10" style={{ background: c.gold, borderRadius: r === RADIUS.arch ? 2 : r }} />
      </div>,
    split:
    <div className="grid h-full grid-cols-2 gap-2 p-2">
        <div className="flex flex-col justify-center gap-1">
          {line('40%', 2, c.gold)}
          {line('95%', 5)}
          {line('70%', 5)}
        </div>
        <span style={{ background: tile, borderRadius: r }} />
      </div>,
    collage:
    <div className="relative h-full">
        <span className="absolute left-2 top-2 h-9 w-7 -rotate-6 shadow" style={{ background: tile, borderRadius: r }} />
        <span className="absolute right-2 top-1.5 h-8 w-6 rotate-6 shadow" style={{ background: c.gold, opacity: 0.6, borderRadius: r }} />
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1">
          {line('40%', 5)}
          {line('25%', 3, c.gold)}
        </div>
      </div>
  }[t.layout.hero];

  const cats = t.layout.categories;
  return (
    <div className="flex h-full flex-col" style={{ background: bg }}>
      <div className="h-[58%]">{hero}</div>
      <div className={`flex flex-1 gap-1.5 px-2 py-1.5 ${cats === 'scroll' ? 'overflow-hidden' : ''}`}>
        {[0, 1, 2, 3].map((i) =>
        <span
          key={i}
          className={cats === 'scroll' ? 'h-full w-[38%] shrink-0' : 'h-full flex-1'}
          style={{
            background: tile,
            borderRadius: cats === 'circle' ? '999px' : cats === 'arch' ? RADIUS.arch : r
          }} />

        )}
      </div>
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
        // The editor shows the site's own colours; the new-client form shows each template's suggestion.
        const c = colors ?? (PALETTES.find((p) => p.id === t.palette) ?? PALETTES[0]).colors;
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
              <p className="mt-1.5 flex flex-wrap gap-1">
                {[t.mode, t.intro, t.motion, t.hover, t.scroll !== 'none' && t.scroll].filter(Boolean).map((tag) =>
                <span key={String(tag)} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-500">
                    {tag}
                  </span>
                )}
              </p>
            </div>
          </button>);

      })}
    </div>);

}

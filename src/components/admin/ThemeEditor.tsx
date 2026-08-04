import { useMemo, useState } from 'react';
import {
  AlertTriangleIcon,
  CheckIcon,
  PaletteIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldCheckIcon,
  Trash2Icon } from
'lucide-react';
import { useContent } from '../../hooks/useContent';
import {
  COLOR_FIELDS,
  CUSTOM_PALETTE_PREFIX,
  FONT_PAIRS,
  PALETTES,
  PALETTE_GROUPS,
  isCustomPaletteId } from
'../../data/palettes';
import { isValidHex, normalizeHex } from '../../utils/color';
import { checkContrast, contrastFailures } from '../../utils/contrast';
import { assignRoles, parseHexList } from '../../utils/palette';
import type { Palette, ThemeColors } from '../../types/content';

function PaletteCard({
  palette,
  isActive,
  onSelect,
  onDelete






}: {palette: Palette;isActive: boolean;onSelect: () => void;onDelete?: () => void;}) {
  // Built-in palettes are all verified; only saved ones can carry readability issues.
  const issues = onDelete ? contrastFailures(palette.colors).length : 0;
  return (
    <div
      className={`relative rounded-lg border transition-colors ${
      isActive ? 'border-emerald ring-2 ring-emerald/20' : 'border-slate-200 hover:border-slate-300'}`
      }>

      <button type="button" onClick={onSelect} aria-pressed={isActive} className="w-full p-3 text-left">
        <div className="flex overflow-hidden rounded-md">
          {(Object.keys(palette.colors) as (keyof ThemeColors)[]).map((key) =>
          <span
            key={key}
            className="h-10 flex-1"
            style={{ backgroundColor: palette.colors[key] }}
            aria-hidden />

          )}
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{palette.name}</p>
            {issues > 0 ?
            <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                <AlertTriangleIcon className="h-3 w-3" />
                {issues} readability {issues === 1 ? 'issue' : 'issues'}
              </span> :

            <p className="truncate text-xs text-slate-500">{palette.description}</p>
            }
          </div>
          {isActive && <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />}
        </div>
      </button>
      {onDelete &&
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${palette.name}`}
        className="absolute right-2 top-2 rounded bg-white/85 p-1.5 text-slate-400 backdrop-blur hover:bg-white hover:text-red-600">

          <Trash2Icon className="h-3.5 w-3.5" />
        </button>
      }
    </div>);

}

export function ThemeEditor() {
  const { content, updateTheme } = useContent();
  const { theme } = content;
  const [query, setQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [pasted, setPasted] = useState('');
  const [notice, setNotice] = useState<{text: string;warn?: boolean;} | null>(null);

  const customPalettes = useMemo(() => theme.customPalettes ?? [], [theme.customPalettes]);
  const activePalette = useMemo(
    () => [...PALETTES, ...customPalettes].find((p) => p.id === theme.paletteId),
    [customPalettes, theme.paletteId]
  );

  const isCustomised =
  !!activePalette &&
  COLOR_FIELDS.some((field) => activePalette.colors[field.key] !== theme.colors[field.key]);

  /* Live readability check on whatever colours are currently set — this is what
     makes a hand-built palette as trustworthy as the built-in ones. */
  const contrast = useMemo(() => checkContrast(theme.colors), [theme.colors]);
  const contrastIssues = contrast.filter((c) => !c.ok);

  /* Search flattens the groups; without a query the groups are shown in order. */
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return [...PALETTES, ...customPalettes].filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [customPalettes, query]);

  const pastedColors = useMemo(() => parseHexList(pasted), [pasted]);
  const pastedRoles = useMemo(() => assignRoles(pastedColors), [pastedColors]);

  function applyPasted() {
    // A pasted set is not one of the saved palettes, so it has no id until saved.
    updateTheme({ paletteId: '', colors: { ...pastedRoles } });
    setNotice({
      text: `Applied ${pastedColors.length} pasted colours. Name them below to save the palette.`
    });
    setPasted('');
  }

  function selectPalette(palette: Palette) {
    updateTheme({ paletteId: palette.id, colors: { ...palette.colors } });
    setNotice(null);
  }

  function setColor(key: keyof ThemeColors, value: string) {
    updateTheme({ colors: { ...theme.colors, [key]: value } as ThemeColors });
  }

  function saveCurrentColours() {
    const name = newName.trim();
    if (!name) return;
    // Saving under an existing name updates it rather than creating a near-duplicate.
    const existing = customPalettes.find((p) => p.name.toLowerCase() === name.toLowerCase());
    const palette: Palette = {
      id: existing?.id ?? `${CUSTOM_PALETTE_PREFIX}${Date.now()}`,
      name,
      description: 'Your saved colours',
      colors: { ...theme.colors }
    };
    updateTheme({
      customPalettes: existing ?
      customPalettes.map((p) => p.id === existing.id ? palette : p) :
      [...customPalettes, palette],
      paletteId: palette.id
    });
    setNewName('');
    const saved = existing ? `Updated “${name}”.` : `Saved “${name}” to your palettes.`;
    setNotice(
      contrastIssues.length > 0 ?
      {
        text:
        `${saved} Heads up: ${contrastIssues.length} colour pair` +
        `${contrastIssues.length === 1 ? '' : 's'} may be hard to read — see the readability check below.`,
        warn: true
      } :
      { text: saved }
    );
  }

  function deleteCustom(palette: Palette) {
    updateTheme({
      customPalettes: customPalettes.filter((p) => p.id !== palette.id),
      // Keep the colours on screen; they are simply no longer tied to a saved palette.
      ...(theme.paletteId === palette.id ? { paletteId: '' } : {})
    });
    setNotice({ text: `Deleted “${palette.name}”.` });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald">Appearance</p>
        <h2 className="mt-1 text-2xl font-medium text-slate-900">Colours & typography</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pick a palette to restyle the whole site instantly, fine-tune any single colour, then save
          your own combination as a palette you can reuse.
        </p>
      </header>

      {notice &&
      <p
        role="status"
        className={`rounded-md px-3 py-2 text-xs ${
        notice.warn ? 'bg-amber-50 text-amber-800' : 'bg-emerald/10 text-emerald'}`
        }>

          {notice.text}
        </p>
      }

      {/* ---------- Your palettes ---------- */}
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Your palettes <span className="text-slate-300">({customPalettes.length})</span>
          </h3>
        </div>

        {/* Paste a palette from anywhere — this is where colours come in, as opposed
            to the name field below, which only names the six colours already set. */}
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50/60 p-3">
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
              Paste colours
            </span>
            <input
              type="text"
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="#D90000 #FFEA93 #8DB355 #000000"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 outline-none placeholder:font-sans placeholder:text-slate-400 focus:border-emerald focus:ring-2 focus:ring-emerald/15" />

          </label>
          <p className="mt-1 text-xs text-slate-400">
            Any number of hex codes, from Coolors, Adobe or anywhere else — spaces, commas or new
            lines all work.
          </p>

          {pastedColors.length > 0 &&
          <>
              <div className="mt-3 flex flex-wrap gap-2">
                {pastedColors.map((hex) =>
              <div key={hex} className="w-[4.5rem]">
                    <span
                  className="block h-12 w-full rounded-md border border-slate-200"
                  style={{ backgroundColor: hex }} />

                    <span className="mt-1 block text-center font-mono text-[10px] uppercase text-slate-500">
                      {hex}
                    </span>
                  </div>
              )}
              </div>

              <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  How they will be used
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  The site needs six specific roles, so colours are matched by lightness and nudged
                  where needed to stay readable.
                </p>
                <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {COLOR_FIELDS.map((field) =>
                <li key={field.key} className="flex items-center gap-2">
                      <span
                    className="h-5 w-5 shrink-0 rounded border border-slate-200"
                    style={{ backgroundColor: pastedRoles[field.key] }} />

                      <span className="truncate text-xs text-slate-600">{field.label}</span>
                      <span className="ml-auto font-mono text-[10px] uppercase text-slate-400">
                        {pastedRoles[field.key]}
                      </span>
                    </li>
                )}
                </ul>
                <button
                type="button"
                onClick={applyPasted}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-emerald px-4 py-2 text-xs font-medium text-white hover:bg-emerald-deep">

                  <PaletteIcon className="h-3.5 w-3.5" />
                  Use these {pastedColors.length} colours
                </button>
              </div>
            </>
          }
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                saveCurrentColours();
              }
            }}
            placeholder="Name your colours, e.g. Diwali 2026"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/15" />

          <button
            type="button"
            onClick={saveCurrentColours}
            disabled={!newName.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald px-4 py-2 text-xs font-medium text-white hover:bg-emerald-deep disabled:opacity-50">

            <PlusIcon className="h-3.5 w-3.5" />
            Save current colours
          </button>
        </div>
        {/* The mistake this catches: pasting hex codes into the *name* box, which
            only names the colours already set rather than importing new ones. */}
        {parseHexList(newName).length > 0 ?
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Those look like colours, not a name. Paste them into <strong>Paste colours</strong> above to
            actually use them — this box only names the six colours that are already applied.
          </p> :

        <p className="mt-2 text-xs text-slate-400">
            Saves the six colours below as a reusable palette. Reusing a name updates that palette.
            Your palettes are stored with your content, so they are available wherever you sign in.
          </p>
        }

        {customPalettes.length > 0 &&
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {customPalettes.map((palette) =>
          <PaletteCard
            key={palette.id}
            palette={palette}
            isActive={palette.id === theme.paletteId}
            onSelect={() => selectPalette(palette)}
            onDelete={() => deleteCustom(palette)} />

          )}
          </div>
        }
      </section>

      {/* ---------- Built-in palettes ---------- */}
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Palettes <span className="text-slate-300">({PALETTES.length})</span>
          </h3>
          <label className="relative min-w-[12rem] flex-1 sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <span className="sr-only">Search palettes</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search palettes…"
              className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/15" />

          </label>
        </div>

        {matches ?
        matches.length === 0 ?
        <p className="mt-4 py-6 text-center text-sm text-slate-400">
              No palette matches “{query}”.
            </p> :

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {matches.map((palette) =>
          <PaletteCard
            key={palette.id}
            palette={palette}
            isActive={palette.id === theme.paletteId}
            onSelect={() => selectPalette(palette)}
            onDelete={isCustomPaletteId(palette.id) ? () => deleteCustom(palette) : undefined} />

          )}
            </div> :


        <div className="mt-4 space-y-6">
            {PALETTE_GROUPS.map((group) => {
            const items = group.ids.
            map((id) => PALETTES.find((p) => p.id === id)).
            filter((p): p is Palette => Boolean(p));
            if (items.length === 0) return null;
            return (
              <div key={group.name}>
                  <p className="text-xs font-medium text-slate-500">{group.name}</p>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((palette) =>
                  <PaletteCard
                    key={palette.id}
                    palette={palette}
                    isActive={palette.id === theme.paletteId}
                    onSelect={() => selectPalette(palette)} />

                  )}
                  </div>
                </div>);

          })}
          </div>
        }

        {isCustomised && activePalette &&
        <button
          type="button"
          onClick={() => updateTheme({ colors: { ...activePalette.colors } })}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400">

            <RotateCcwIcon className="h-3.5 w-3.5" />
            Restore {activePalette.name} colours
          </button>
        }
      </section>

      {/* ---------- Fine-tune ---------- */}
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Fine-tune colours
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {COLOR_FIELDS.map((field) => {
            const value = theme.colors[field.key];
            return (
              <div key={field.key} className="flex items-center gap-3 rounded-md border border-slate-200 p-3">
                <input
                  type="color"
                  value={isValidHex(value) ? normalizeHex(value) : '#000000'}
                  onChange={(e) => setColor(field.key, e.target.value)}
                  aria-label={`${field.label} colour picker`}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded border border-slate-200 bg-white" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{field.label}</p>
                  <p className="text-xs text-slate-400">{field.hint}</p>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setColor(field.key, e.target.value)}
                    className={`mt-2 w-full rounded border px-2 py-1 font-mono text-xs uppercase outline-none focus:ring-2 focus:ring-emerald/15 ${
                    isValidHex(value) ? 'border-slate-300 text-slate-700' : 'border-red-400 text-red-600'}`
                    } />

                </div>
              </div>);

          })}
        </div>

        {/* Readability of the current colours, checked the way the page renders them. */}
        <div
          className={`mt-4 rounded-md border p-3 ${
          contrastIssues.length === 0 ? 'border-emerald/30 bg-emerald/5' : 'border-amber-300 bg-amber-50'}`
          }>

          <div className="flex items-center gap-2">
            {contrastIssues.length === 0 ?
            <ShieldCheckIcon className="h-4 w-4 shrink-0 text-emerald" /> :

            <AlertTriangleIcon className="h-4 w-4 shrink-0 text-amber-600" />
            }
            <p
              className={`text-xs font-medium ${
              contrastIssues.length === 0 ? 'text-emerald' : 'text-amber-800'}`
              }>

              {contrastIssues.length === 0 ?
              `Readable — all ${contrast.length} colour pairs pass.` :
              `${contrastIssues.length} of ${contrast.length} colour pairs are hard to read.`}
            </p>
          </div>

          {contrastIssues.length > 0 &&
          <ul className="mt-2 space-y-1">
              {contrastIssues.map((issue) =>
            <li key={`${issue.fg}-${issue.bg}`} className="text-xs text-amber-900">
                  <span className="font-medium">{issue.where}</span>
                  {' — '}
                  <span className="font-mono">{issue.ratio.toFixed(2)}:1</span>
                  {` (needs ${issue.min}:1). Try a `}
                  {COLOR_FIELDS.find((f) => f.key === issue.fg)?.label.toLowerCase()}
                  {' further from your '}
                  {COLOR_FIELDS.find((f) => f.key === issue.bg)?.label.toLowerCase()}
                  .
                </li>
            )}
            </ul>
          }
        </div>
      </section>

      {/* ---------- Fonts ---------- */}
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Font pairing</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FONT_PAIRS.map((pair) => {
            const isActive = pair.id === theme.fontId;
            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => updateTheme({ fontId: pair.id })}
                aria-pressed={isActive}
                className={`rounded-lg border p-4 text-left transition-colors ${
                isActive ? 'border-emerald ring-2 ring-emerald/20' : 'border-slate-200 hover:border-slate-300'}`
                }>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-500">{pair.name}</p>
                  {isActive && <CheckIcon className="h-4 w-4 text-emerald" />}
                </div>
                <p className="mt-3 text-2xl leading-tight text-slate-900" style={{ fontFamily: pair.display }}>
                  Brilliance, remembered
                </p>
                <p className="mt-2 text-sm text-slate-500" style={{ fontFamily: pair.body }}>
                  Ethically sourced diamonds, hand-set in our atelier.
                </p>
              </button>);

          })}
        </div>
      </section>

      {/* ---------- Live preview ---------- */}
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Live preview</h3>
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
          <div className="bg-emerald px-4 py-2 text-center text-[10px] uppercase tracking-widest text-cream">
            Complimentary insured shipping
          </div>
          <div className="bg-cream p-7">
            <p className="eyebrow text-gold">The Solitaire Edit</p>
            <p className="display display-3 mt-4 text-ink">Brilliance that outlives the moment</p>
            <p className="body-sm mt-3 max-w-md text-ink/65">
              This block uses the same tokens as the live landing page.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="btn btn-primary btn-sm">Shop the edit</span>
              <span className="btn btn-outline btn-sm">Book a consultation</span>
            </div>
          </div>
          <div className="meta bg-sand p-4 text-center text-ink/60">
            Alternate section background
          </div>
        </div>
      </section>
    </div>);

}

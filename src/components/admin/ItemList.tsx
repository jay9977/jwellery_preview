import React, { useState } from 'react';
import { ChevronDownIcon, CopyIcon, ChevronUpIcon, PlusIcon, Trash2Icon } from 'lucide-react';

interface ItemListProps<T> {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  addLabel: string;
  itemTitle: (item: T, index: number) => string;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  emptyText?: string;
}

export function ItemList<T extends {id: string;}>({
  title,
  items,
  onChange,
  createItem,
  addLabel,
  itemTitle,
  renderItem,
  emptyText = 'Nothing here yet.'
}: ItemListProps<T>) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  function update(id: string, patch: Partial<T>) {
    onChange(items.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function remove(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function duplicate(id: string) {
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return;
    const copy = { ...items[index], id: `${id}-${Date.now()}` };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    onChange(next);
    setOpenId(copy.id);
  }

  function move(id: string, direction: -1 | 1) {
    const from = items.findIndex((item) => item.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= items.length) return;
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  }

  function add() {
    const item = createItem();
    onChange([...items, item]);
    setOpenId(item.id);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          {title} <span className="text-slate-300">({items.length})</span>
        </h3>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-deep">
          
          <PlusIcon className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </header>

      {items.length === 0 ?
      <p className="px-4 py-6 text-sm text-slate-400">{emptyText}</p> :

      <ul className="divide-y divide-slate-100">
          {items.map((item, index) => {
          const isOpen = openId === item.id;
          return (
            <li key={item.id}>
                <div className="flex items-center gap-1 px-3 py-2.5">
                  <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="flex flex-1 items-center gap-2 text-left">
                  
                    {isOpen ?
                  <ChevronUpIcon className="h-4 w-4 text-slate-400" /> :

                  <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                  }
                    <span className="truncate text-sm font-medium text-slate-800">
                      {itemTitle(item, index) || 'Untitled'}
                    </span>
                  </button>
                  <button
                  type="button"
                  aria-label="Move up"
                  onClick={() => move(item.id, -1)}
                  disabled={index === 0}
                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30">
                  
                    <ChevronUpIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                  type="button"
                  aria-label="Move down"
                  onClick={() => move(item.id, 1)}
                  disabled={index === items.length - 1}
                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30">
                  
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                  type="button"
                  aria-label="Duplicate"
                  onClick={() => duplicate(item.id)}
                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  
                    <CopyIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                  type="button"
                  aria-label="Delete"
                  onClick={() => remove(item.id)}
                  className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                  
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </button>
                </div>

                {isOpen &&
              <div className="space-y-4 border-t border-slate-100 bg-slate-50/60 px-4 py-4">
                    {renderItem(item, (patch) => update(item.id, patch))}
                  </div>
              }
              </li>);

        })}
        </ul>
      }
    </section>);

}
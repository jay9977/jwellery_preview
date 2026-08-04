import React, { useRef, useState } from 'react';
import { ImageIcon, Loader2Icon, UploadIcon } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import { isConnected } from '../../utils/backend';
import { uploadImage } from '../../utils/api';

interface BaseProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}

export function TextField({ label, value, onChange, placeholder, hint }: BaseProps) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald focus:ring-2 focus:ring-emerald/15" />
      
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>);

}

export function TextAreaField({ label, value, onChange, placeholder, hint }: BaseProps) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald focus:ring-2 focus:ring-emerald/15" />
      
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>);

}

export function SelectField({
  label,
  value,
  onChange,
  options





}: {label: string;value: string;onChange: (value: string) => void;options: {value: string;label: string;}[];}) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/15">
        
        {options.map((option) =>
        <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )}
      </select>
    </label>);

}

export function ImageField({ label, value, onChange }: BaseProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { backend } = useContent();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadError('');

    // When a backend is connected, store the file on the server and use its URL.
    if (isConnected(backend)) {
      setUploading(true);
      try {
        onChange(await uploadImage(backend, file));
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed.');
      } finally {
        setUploading(false);
      }
      return;
    }

    // Offline fallback: inline the image as a data URL.
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">{label}</span>
      <div className="mt-2 flex gap-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {value ?
          <img src={value} alt="" className="h-full w-full object-cover" /> :

          <span className="flex h-full w-full items-center justify-center text-slate-300">
              <ImageIcon className="h-5 w-5" />
            </span>
          }
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald focus:ring-2 focus:ring-emerald/15" />
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400 disabled:opacity-60">

              {uploading ?
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> :

              <UploadIcon className="h-3.5 w-3.5" />
              }
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            {value &&
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs text-slate-400 hover:text-red-500">
              
                Remove
              </button>
            }
          </div>
          {uploadError &&
          <p role="alert" className="text-xs text-red-600">
              {uploadError}
            </p>
          }
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
      </div>
    </div>);

}

export function ToggleField({
  label,
  checked,
  onChange,
  description





}: {label: string;checked: boolean;onChange: (checked: boolean) => void;description?: string;}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-emerald' : 'bg-slate-300'}`
        }>
        
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`
          } />
        
      </button>
    </div>);

}
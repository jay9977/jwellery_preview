import React, { useRef, useState } from 'react';
import { AlertTriangleIcon, ImageIcon, Loader2Icon, PlayIcon, UploadIcon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { isConnected } from '../../utils/backend';
import { uploadImage } from '../../utils/api';
import { isVideo, parseMedia } from '../../utils/media';
import { MediaEmbed } from '../site/MediaEmbed';

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

/**
 * URL field for a video or image. Tells the admin what the link was recognised as
 * and previews it, so a wrong paste is obvious before it reaches the live page.
 */
export function MediaField({ label, value, onChange, placeholder, hint }: BaseProps) {
  const media = parseMedia(value);
  const unusable = value.trim().length > 0 && media.kind === 'none';

  return (
    <div>
      <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'https://youtube.com/watch?v=… or https://…/clip.mp4'}
        className={`mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-emerald/15 ${
        unusable ? 'border-red-400' : 'border-slate-300 focus:border-emerald'}`
        } />

      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}

      {value.trim() &&
      <div className="mt-2">
          <span
          className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium ${
          unusable ? 'bg-red-50 text-red-700' : 'bg-emerald/10 text-emerald'}`
          }>

            {unusable ?
          <AlertTriangleIcon className="h-3 w-3" /> :
          isVideo(media) ?
          <PlayIcon className="h-3 w-3" /> :

          <ImageIcon className="h-3 w-3" />
          }
            {media.description || 'Not recognised'}
          </span>

          {!unusable &&
        <div className="mt-2 max-w-xs overflow-hidden rounded-md border border-slate-200">
              <MediaEmbed
            url={value}
            title={label}
            aspect={media.kind === 'image' ? 'aspect-[4/3]' : 'aspect-video'} />

            </div>
        }
        </div>
      }
    </div>);

}

/** Numeric size control — used for logo heights, where a free-text px value invites typos. */
export function SliderField({
  label,
  value,
  onChange,
  min = 20,
  max = 120,
  step = 1,
  hint



}: {label: string;value: number;onChange: (value: number) => void;min?: number;max?: number;step?: number;hint?: string;}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">{label}</span>
        <span className="text-xs tabular-nums text-slate-400">{value}px</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-emerald" />

      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>);

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
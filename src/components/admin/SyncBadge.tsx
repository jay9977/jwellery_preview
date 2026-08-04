import { AlertTriangleIcon, CheckIcon, CloudOffIcon, Loader2Icon } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';

export function SyncBadge() {
  const { syncStatus, isDirty } = useContent();

  const map = {
    offline: { icon: CloudOffIcon, label: 'Local only', className: 'text-slate-500 border-slate-200' },
    loading: { icon: Loader2Icon, label: 'Loading…', className: 'text-slate-600 border-slate-200' },
    saving: { icon: Loader2Icon, label: 'Saving…', className: 'text-slate-600 border-slate-200' },
    synced: {
      icon: CheckIcon,
      label: isDirty ? 'Unsaved changes' : 'Synced',
      className: isDirty ? 'text-amber-600 border-amber-200' : 'text-emerald border-emerald/30'
    },
    error: { icon: AlertTriangleIcon, label: 'Sync failed', className: 'text-red-600 border-red-200' }
  } as const;

  const { icon: Icon, label, className } = map[syncStatus];
  const spinning = syncStatus === 'loading' || syncStatus === 'saving';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium ${className}`}>
      
      <Icon className={`h-3.5 w-3.5 ${spinning ? 'animate-spin' : ''}`} />
      {label}
    </span>);

}
import { useContext } from 'react';
import { ContentContext, type ContentContextValue } from '../contexts/content-context';

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside a ContentProvider');
  return ctx;
}

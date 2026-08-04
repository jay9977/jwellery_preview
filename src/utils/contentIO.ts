import type { SiteContent } from '../types/content';

export function exportContent(content: SiteContent, fileName = 'landing-content.json') {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importContent(file: File): Promise<SiteContent> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as SiteContent;
        if (!parsed || typeof parsed !== 'object' || !parsed.sections) {
          reject(new Error('That file is not a valid content export.'));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error('That file is not valid JSON.'));
      }
    };
    reader.readAsText(file);
  });
}
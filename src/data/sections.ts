import { SECTION_LABELS } from './defaultContent';
import { uid } from '../utils/id';
import type {
  BuiltInSectionId,
  CustomItem,
  CustomLayout,
  CustomSection,
  SectionBackground,
  SectionId,
  SiteSection } from
'../types/content';

/** Marks a section the admin created, so it can be deleted and edited generically. */
export const CUSTOM_SECTION_PREFIX = 'custom-';

export function isCustomSectionId(id: SectionId): boolean {
  return String(id).startsWith(CUSTOM_SECTION_PREFIX);
}

export function isCustomSection(section: SiteSection | undefined): section is CustomSection {
  return !!section && (section as CustomSection).kind === 'custom';
}

/** The name shown in the admin sidebar and section editor. */
export function sectionLabel(id: SectionId, section?: SiteSection): string {
  const custom = section?.label?.trim();
  if (custom) return custom;
  return SECTION_LABELS[id as BuiltInSectionId] ?? 'Untitled section';
}

export const LAYOUT_OPTIONS: {value: CustomLayout;label: string;hint: string;}[] = [
{ value: 'text', label: 'Text block', hint: 'A heading with paragraphs and an optional button.' },
{
  value: 'cards',
  label: 'Cards grid',
  hint: 'Cards in a responsive grid. Each card can show an image or a video.'
},
{ value: 'banner', label: 'Image banner', hint: 'Full-width image with a headline and button on top.' },
{
  value: 'gallery',
  label: 'Image / video gallery',
  hint: 'A grid of images and videos with optional captions.'
},
{
  value: 'video',
  label: 'Video',
  hint: 'One large video (YouTube, Vimeo or a video file), with optional extra videos below.'
}];


export const BACKGROUND_OPTIONS: {value: SectionBackground;label: string;}[] = [
{ value: 'cream', label: 'Page background' },
{ value: 'sand', label: 'Alternate background' },
{ value: 'ink', label: 'Dark band' }];


export function createCustomItem(): CustomItem {
  return {
    id: uid('ci'),
    title: 'New item',
    text: 'Describe it here.',
    image: '',
    video: '',
    linkLabel: '',
    linkHref: ''
  };
}

export function createCustomSection(label = 'New section'): {id: string;section: CustomSection;} {
  return {
    id: `${CUSTOM_SECTION_PREFIX}${Date.now()}`,
    section: {
      kind: 'custom',
      visible: true,
      label,
      layout: 'text',
      background: 'cream',
      eyebrow: '',
      title: label,
      subtitle: '',
      body: 'Write the content for this section here.\n\nLeave a blank line to start a new paragraph.',
      ctaLabel: '',
      ctaHref: '',
      image: '',
      video: '',
      videoPoster: '',
      items: []
    }
  };
}

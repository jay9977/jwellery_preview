import {
  AtSignIcon,
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  LinkedinIcon,
  MessageCircleIcon,
  MusicIcon,
  PinIcon,
  SendIcon,
  TwitterIcon,
  YoutubeIcon } from
'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SocialPlatform } from '../types/content';

/**
 * lucide only ships brand marks for some networks; the rest fall back to a
 * shape that still reads correctly (a pin for Pinterest, a note for TikTok).
 */
export const SOCIAL_PLATFORMS: {value: SocialPlatform;label: string;icon: LucideIcon;placeholder: string;}[] = [
{ value: 'instagram', label: 'Instagram', icon: InstagramIcon, placeholder: 'https://instagram.com/yourhandle' },
{ value: 'facebook', label: 'Facebook', icon: FacebookIcon, placeholder: 'https://facebook.com/yourpage' },
{ value: 'youtube', label: 'YouTube', icon: YoutubeIcon, placeholder: 'https://youtube.com/@yourchannel' },
{ value: 'twitter', label: 'X / Twitter', icon: TwitterIcon, placeholder: 'https://x.com/yourhandle' },
{ value: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon, placeholder: 'https://linkedin.com/company/you' },
{ value: 'pinterest', label: 'Pinterest', icon: PinIcon, placeholder: 'https://pinterest.com/yourhandle' },
{ value: 'tiktok', label: 'TikTok', icon: MusicIcon, placeholder: 'https://tiktok.com/@yourhandle' },
{ value: 'whatsapp', label: 'WhatsApp', icon: MessageCircleIcon, placeholder: 'https://wa.me/919820012345' },
{ value: 'telegram', label: 'Telegram', icon: SendIcon, placeholder: 'https://t.me/yourhandle' },
{ value: 'email', label: 'Email', icon: AtSignIcon, placeholder: 'mailto:care@example.com' },
{ value: 'website', label: 'Website / other', icon: GlobeIcon, placeholder: 'https://example.com' }];


export const SOCIAL_OPTIONS = SOCIAL_PLATFORMS.map(({ value, label }) => ({ value, label }));

export function socialIcon(platform: SocialPlatform): LucideIcon {
  return SOCIAL_PLATFORMS.find((p) => p.value === platform)?.icon ?? GlobeIcon;
}

export function socialPlaceholder(platform: SocialPlatform): string {
  return SOCIAL_PLATFORMS.find((p) => p.value === platform)?.placeholder ?? 'https://example.com';
}

/** Only render links that actually point somewhere. */
export function usableSocialLinks<T extends {url: string;}>(links: T[] | undefined): T[] {
  return (links ?? []).filter((link) => link.url.trim().length > 0);
}

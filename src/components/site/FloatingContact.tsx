import { useEffect, useState } from 'react';
import { ArrowUpIcon, MessageCircleIcon, PhoneIcon, XIcon } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';

/**
 * Candere-style floating contact launcher: WhatsApp chat + phone call,
 * plus a back-to-top button. The phone number comes from Brand settings
 * in the admin panel, so it stays fully editable.
 */
export function FloatingContact() {
  const { content } = useContent();
  const phone = content.brand.phone?.trim() ?? '';
  const digits = phone.replace(/[^\d]/g, '');
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!digits) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {showTop &&
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-cream/95 text-ink/60 shadow-md backdrop-blur transition-colors hover:border-emerald hover:text-emerald">

          <ArrowUpIcon className="h-4 w-4" />
        </button>
      }

      {open &&
      <div className="flex flex-col items-stretch gap-2">
          <a
          href={`https://wa.me/${digits}?text=${encodeURIComponent(
            `Hi ${content.brand.name}! I would like to know more about your jewellery.`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-full bg-[#25d366] py-2.5 pl-3.5 pr-5 text-xs font-medium text-white shadow-lg transition-transform hover:scale-[1.03]">

            <MessageCircleIcon className="h-4 w-4" />
            Chat on WhatsApp
          </a>
          <a
          href={`tel:${phone.replace(/\s/g, '')}`}
          className="flex items-center gap-2.5 rounded-full bg-emerald py-2.5 pl-3.5 pr-5 text-xs font-medium text-cream shadow-lg transition-transform hover:scale-[1.03]">

            <PhoneIcon className="h-4 w-4" />
            Call {phone}
          </a>
        </div>
      }

      <button
        type="button"
        aria-label={open ? 'Close contact options' : 'Contact us'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-emerald text-cream shadow-xl transition-transform hover:scale-105">

        {open ? <XIcon className="h-5 w-5" /> : <MessageCircleIcon className="h-5 w-5" />}
      </button>
    </div>);

}

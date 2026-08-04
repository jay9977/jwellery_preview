import React, { useState } from 'react';
import { CheckIcon, ClockIcon, Loader2Icon, MailIcon, MapPinIcon, MessageCircleIcon, PhoneIcon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { SectionHeading } from './SectionHeading';
import { socialIcon, usableSocialLinks } from '../../data/social';
import type { ContactSection } from '../../types/content';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function DetailRow({
  icon: Icon,
  label,
  children




}: {icon: typeof PhoneIcon;label: string;children: React.ReactNode;}) {
  return (
    <div className="flex gap-3.5">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald/10 text-emerald">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="eyebrow text-ink/45">{label}</p>
        <div className="body-sm mt-1 text-ink/75">{children}</div>
      </div>
    </div>);

}

export function Contact({ data }: {data: ContactSection;}) {
  const { content, sendEnquiry } = useContent();
  const social = usableSocialLinks(content.footer.social);

  // `website` is a honeypot: hidden from people, irresistible to bots.
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const whatsappDigits = data.whatsapp.replace(/[^\d]/g, '');

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (status === 'error') setStatus('idle');
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === 'sending') return;

    if (!form.name.trim()) {
      setError('Please tell us your name.');
      setStatus('error');
      return;
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      setError('Please enter a valid email address so we can reply.');
      setStatus('error');
      return;
    }
    if (form.message.trim().length < 5) {
      setError('Please add a short message.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    try {
      await sendEnquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        website: form.website
      });
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message. Please try again.');
      setStatus('error');
    }
  }

  const hasDetails =
  data.address || data.phone || data.email || data.hours || whatsappDigits || social.length > 0;

  return (
    <section id="contact" className="section-y w-full bg-cream">
      <div className="shell">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />

        <div
          className={`mt-12 grid grid-cols-1 gap-10 ${
          data.showForm && hasDetails ? 'lg:grid-cols-2 lg:gap-14' : ''}`
          }>

          {hasDetails &&
          <div className="space-y-7">
              {data.address &&
            <DetailRow icon={MapPinIcon} label="Visit us">
                  <address className="not-italic">{data.address}</address>
                </DetailRow>
            }

              {data.phone &&
            <DetailRow icon={PhoneIcon} label="Call us">
                  <a href={`tel:${data.phone.replace(/\s/g, '')}`} className="transition-colors hover:text-emerald">
                    {data.phone}
                  </a>
                </DetailRow>
            }

              {data.email &&
            <DetailRow icon={MailIcon} label="Email us">
                  <a href={`mailto:${data.email}`} className="break-all transition-colors hover:text-emerald">
                    {data.email}
                  </a>
                </DetailRow>
            }

              {data.hours &&
            <DetailRow icon={ClockIcon} label="Opening hours">
                  {data.hours}
                </DetailRow>
            }

              {whatsappDigits &&
            <a
              href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
                `Hi ${content.brand.name}! I would like to know more about your jewellery.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm">

                  <MessageCircleIcon className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
            }

              {data.showSocial && social.length > 0 &&
            <div>
                  <p className="eyebrow text-ink/45">Follow us</p>
                  <ul className="mt-3 flex flex-wrap gap-2.5">
                    {social.map((link) => {
                  const Icon = socialIcon(link.platform);
                  return (
                    <li key={link.id}>
                          <a
                        href={link.url}
                        target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                        rel="noreferrer"
                        title={link.label}
                        aria-label={link.label}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink/65 transition-colors hover:border-emerald hover:text-emerald">

                            <Icon className="h-4 w-4" />
                          </a>
                        </li>);

                })}
                  </ul>
                </div>
            }

              {data.mapEmbedUrl &&
            <iframe
              src={data.mapEmbedUrl}
              title={`Map to ${content.brand.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-64 w-full rounded-sm border border-ink/10" />

            }
            </div>
          }

          {data.showForm &&
          <div className="border border-ink/10 bg-sand/50 p-6 sm:p-8">
              {status === 'done' ?
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald text-cream">
                    <CheckIcon className="h-5 w-5" />
                  </span>
                  <p className="display display-3 mt-5 text-ink">Message sent</p>
                  <p className="body-sm mt-3 max-w-sm text-ink/65">{data.successMessage}</p>
                  <button
                type="button"
                onClick={() => {
                  setForm({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
                  setStatus('idle');
                }}
                className="btn btn-outline btn-sm mt-6">

                    Send another message
                  </button>
                </div> :

            <>
                  {data.formTitle && <h3 className="display display-3 text-ink">{data.formTitle}</h3>}
                  {data.formNote && <p className="body-sm mt-2 text-ink/60">{data.formNote}</p>}

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                    <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                      <label htmlFor="contact-website">Leave this field empty</label>
                      <input
                    id="contact-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => update('website', e.target.value)} />

                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="eyebrow text-ink/50">Your name</span>
                        <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      autoComplete="name"
                      required
                      className="mt-2 h-11 w-full border border-ink/15 bg-cream px-3 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-emerald" />

                      </label>
                      <label className="block">
                        <span className="eyebrow text-ink/50">Email</span>
                        <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      autoComplete="email"
                      required
                      className="mt-2 h-11 w-full border border-ink/15 bg-cream px-3 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-emerald" />

                      </label>
                      <label className="block">
                        <span className="eyebrow text-ink/50">Phone (optional)</span>
                        <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      autoComplete="tel"
                      className="mt-2 h-11 w-full border border-ink/15 bg-cream px-3 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-emerald" />

                      </label>
                      <label className="block">
                        <span className="eyebrow text-ink/50">Subject (optional)</span>
                        <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => update('subject', e.target.value)}
                      placeholder="Custom design, order status…"
                      className="mt-2 h-11 w-full border border-ink/15 bg-cream px-3 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-emerald" />

                      </label>
                    </div>

                    <label className="block">
                      <span className="eyebrow text-ink/50">Message</span>
                      <textarea
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    rows={5}
                    required
                    className="mt-2 w-full resize-y border border-ink/15 bg-cream px-3 py-2.5 text-sm leading-relaxed text-ink outline-none placeholder:text-ink/35 focus:border-emerald" />

                    </label>

                    {status === 'error' &&
                <p role="alert" className="text-xs text-red-600">
                        {error}
                      </p>
                }

                    <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="btn btn-primary w-full disabled:opacity-60 sm:w-auto">

                      {status === 'sending' && <Loader2Icon className="h-4 w-4 animate-spin" />}
                      {status === 'sending' ? 'Sending…' : data.formCtaLabel}
                    </button>
                  </form>
                </>
            }
            </div>
          }
        </div>
      </div>
    </section>);

}

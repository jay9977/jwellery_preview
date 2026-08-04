import React, { useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import type { NewsletterSection } from '../../types/content';

export function Newsletter({ data }: {data: NewsletterSection;}) {
  const { subscribeEmail } = useContent();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorText, setErrorText] = useState('Please enter a valid email address.');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorText('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      await subscribeEmail(email);
      setStatus('done');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <section id="newsletter" className="section-y w-full bg-sand">
      <div className="shell">
        <div className="mx-auto max-w-[34rem] text-center">
          <h2 className="display display-2 text-ink">{data.title}</h2>
          <p className="body-base mt-4 text-ink/65">{data.body}</p>

          {status === 'done' ?
          <p className="btn btn-primary mt-8">
              <CheckIcon className="h-4 w-4" />
              You’re on the list
            </p> :

          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-2.5 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="your@email.com"
              aria-invalid={status === 'error'}
              className={`h-[46px] flex-1 border bg-cream px-4 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-emerald ${
              status === 'error' ? 'border-red-500' : 'border-ink/15'}`
              } />
            
              <button type="submit" disabled={status === 'loading'} className="btn btn-primary h-[46px] py-0 disabled:opacity-60">
                {status === 'loading' ? 'Adding…' : data.ctaLabel}
              </button>
            </form>
          }

          {status === 'error' &&
          <p role="alert" className="mt-3 text-xs text-red-600">
              {errorText}
            </p>
          }
          {data.note && status !== 'done' && <p className="mt-4 text-xs text-ink/45">{data.note}</p>}
        </div>
      </div>
    </section>);

}
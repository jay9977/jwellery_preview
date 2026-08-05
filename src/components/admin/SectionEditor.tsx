import { useState } from 'react';
import { Trash2Icon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import {
  BACKGROUND_OPTIONS,
  LAYOUT_OPTIONS,
  createCustomItem,
  isCustomSection,
  isCustomSectionId,
  sectionLabel } from
'../../data/sections';
import { ImageField, MediaField, SelectField, TextAreaField, TextField, ToggleField } from './Fields';
import { ItemList } from './ItemList';
import { parseMedia } from '../../utils/media';
import { uid } from '../../utils/id';
import type {
  CustomLayout,
  IconKey,
  SectionBackground,
  SectionId } from
'../../types/content';

const ICON_OPTIONS: {value: IconKey;label: string;}[] = [
{ value: 'gem', label: 'Gem' },
{ value: 'truck', label: 'Shipping' },
{ value: 'shield', label: 'Shield' },
{ value: 'refresh', label: 'Returns' },
{ value: 'award', label: 'Award' },
{ value: 'headset', label: 'Support' }];


export function SectionEditor({ id, onDeleted }: {id: SectionId;onDeleted?: () => void;}) {
  const { content, updateSection, updateCustomSection, toggleSection, renameSection, removeSection } =
  useContent();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const section = content.sections[id];

  /* The selected section can disappear under us — deleted here, removed in another
     tab, or absent from content pulled from the server. Say so instead of crashing. */
  if (!section) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-medium text-slate-900">This section is no longer here</h2>
        <p className="mt-2 text-sm text-slate-500">
          It was deleted, or the content loaded from the server does not include it. Pick another
          section from the sidebar.
        </p>
        <button
          type="button"
          onClick={() => onDeleted?.()}
          className="mt-4 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400">

          Back to the first section
        </button>
      </div>);

  }

  const custom = isCustomSection(section) ? section : null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald">
          {isCustomSectionId(id) ? 'Your section' : 'Section'}
        </p>
        <h2 className="mt-1 text-2xl font-medium text-slate-900">{sectionLabel(id, section)}</h2>
      </header>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <TextField
          label="Section name"
          value={section.label ?? ''}
          onChange={(v) => renameSection(id, v)}
          placeholder={sectionLabel(id)}
          hint="Only shown in this admin panel, to help you find the section. Leave empty for the default name." />

        <ToggleField
          label={section.visible ? 'Visible on the landing page' : 'Hidden from the landing page'}
          description="Hide a section to remove it from the live page without deleting its content."
          checked={section.visible}
          onChange={() => toggleSection(id)} />

      </div>


      {custom &&
      <>
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <SelectField
            label="Layout"
            value={custom.layout}
            onChange={(v) => updateCustomSection(id, { layout: v as CustomLayout })}
            options={LAYOUT_OPTIONS.map(({ value, label }) => ({ value, label }))} />

            <p className="-mt-2 text-xs text-slate-400">
              {LAYOUT_OPTIONS.find((l) => l.value === custom.layout)?.hint}
            </p>
            <SelectField
            label="Background"
            value={custom.background}
            onChange={(v) => updateCustomSection(id, { background: v as SectionBackground })}
            options={BACKGROUND_OPTIONS} />

          </div>

          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <TextField
            label="Eyebrow"
            value={custom.eyebrow}
            onChange={(v) => updateCustomSection(id, { eyebrow: v })}
            hint="Small label above the heading. Leave empty to hide." />

            <TextField
            label="Heading"
            value={custom.title}
            onChange={(v) => updateCustomSection(id, { title: v })}
            hint="Leave empty to hide." />

            <TextAreaField
            label="Sub-heading"
            value={custom.subtitle}
            onChange={(v) => updateCustomSection(id, { subtitle: v })}
            hint="Leave empty to hide." />

          </div>

          {custom.layout === 'text' &&
        <div className="rounded-lg border border-slate-200 bg-white p-4">
              <TextAreaField
            label="Body text"
            value={custom.body}
            onChange={(v) => updateCustomSection(id, { body: v })}
            hint="Leave a blank line between paragraphs." />

            </div>
        }

          {custom.layout === 'banner' &&
        <div className="rounded-lg border border-slate-200 bg-white p-4">
              <ImageField
            label="Background image"
            value={custom.image}
            onChange={(v) => updateCustomSection(id, { image: v })} />

            </div>
        }

          {custom.layout === 'video' &&
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
              <MediaField
            label="Main video"
            value={custom.video ?? ''}
            onChange={(v) => updateCustomSection(id, { video: v })}
            hint="Paste a YouTube or Vimeo link, or a direct video file URL (.mp4, .webm). Add more videos below." />

              {parseMedia(custom.video ?? '').kind === 'file' &&
          <ImageField
            label="Poster image"
            value={custom.videoPoster ?? ''}
            onChange={(v) => updateCustomSection(id, { videoPoster: v })} />

          }
            </div>
        }

          <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
            <TextField
            label="Button label"
            value={custom.ctaLabel}
            onChange={(v) => updateCustomSection(id, { ctaLabel: v })}
            hint="Leave empty to hide the button." />

            <TextField
            label="Button link"
            value={custom.ctaHref}
            onChange={(v) => updateCustomSection(id, { ctaHref: v })}
            placeholder="#contact or https://…" />

          </div>

          {(custom.layout === 'cards' || custom.layout === 'gallery' || custom.layout === 'video') &&
        <ItemList
          title={
          custom.layout === 'cards' ? 'Cards' : custom.layout === 'video' ? 'More videos' : 'Images & videos'
          }
          addLabel={custom.layout === 'cards' ? 'Add card' : 'Add item'}
          items={custom.items}
          onChange={(items) => updateCustomSection(id, { items })}
          itemTitle={(item, index) => item.title || item.text || `Item ${index + 1}`}
          createItem={createCustomItem}
          emptyText={
          custom.layout === 'video' ?
          'No extra videos. The main video above is enough on its own.' :
          'Nothing here yet. Add one to fill the grid.'
          }
          renderItem={(item, update) =>
          <>
                <MediaField
              label="Video link"
              value={item.video ?? ''}
              onChange={(v) => update({ video: v })}
              hint="YouTube, Vimeo or a video file. Leave empty to use the image below instead." />

                {!(item.video ?? '').trim() &&
            <ImageField label="Image" value={item.image ?? ''} onChange={(v) => update({ image: v })} />
            }
                {custom.layout !== 'gallery' &&
            <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
            }
                <TextAreaField
              label={custom.layout === 'gallery' ? 'Caption' : 'Text'}
              value={item.text}
              onChange={(v) => update({ text: v })}
              hint="Leave empty to hide." />

                {custom.layout === 'cards' &&
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextField
                label="Link label"
                value={item.linkLabel}
                onChange={(v) => update({ linkLabel: v })}
                hint="Leave empty to hide." />

                    <TextField
                label="Link target"
                value={item.linkHref}
                onChange={(v) => update({ linkHref: v })}
                placeholder="#contact or https://…" />

                  </div>
            }
              </>
          } />

        }

          <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-red-700">Danger zone</p>
            <p className="mt-1 text-sm text-slate-600">
              Deleting removes this section and its content from the page for good.
            </p>
            {confirmDelete ?
          <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
              type="button"
              onClick={() => {
                removeSection(id);
                setConfirmDelete(false);
                onDeleted?.();
              }}
              className="rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700">

                  Yes, delete “{sectionLabel(id, section)}”
                </button>
                <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600">

                  Cancel
                </button>
              </div> :

          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100">

                <Trash2Icon className="h-3.5 w-3.5" />
                Delete this section
              </button>
          }
          </div>
        </>
      }

      {id === 'hero' &&
      <>
          <ToggleField
          label="Auto-rotate slides"
          description="Slides change every 6 seconds."
          checked={content.sections.hero.autoplay}
          onChange={(value) => updateSection('hero', { autoplay: value })} />
        
          <ItemList
          title="Slides"
          addLabel="Add slide"
          items={content.sections.hero.slides}
          onChange={(slides) => updateSection('hero', { slides })}
          itemTitle={(item) => item.title}
          createItem={() => ({
            id: uid('slide'),
            eyebrow: 'New collection',
            title: 'Headline goes here',
            subtitle: 'Supporting line for this slide.',
            primaryLabel: 'Shop now',
            secondaryLabel: '',
            image: ''
          })}
          renderItem={(item, update) =>
          <>
                <TextField label="Eyebrow" value={item.eyebrow} onChange={(v) => update({ eyebrow: v })} />
                <TextField label="Headline" value={item.title} onChange={(v) => update({ title: v })} />
                <TextAreaField label="Subtitle" value={item.subtitle} onChange={(v) => update({ subtitle: v })} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                label="Primary button"
                value={item.primaryLabel}
                onChange={(v) => update({ primaryLabel: v })} />
              
                  <TextField
                label="Secondary button"
                value={item.secondaryLabel}
                onChange={(v) => update({ secondaryLabel: v })}
                hint="Leave empty to hide" />
              
                </div>
                <ImageField label="Slide image" value={item.image} onChange={(v) => update({ image: v })} />
              </>
          } />
        
        </>
      }

      {id === 'categories' &&
      <>
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <TextField
            label="Eyebrow"
            value={content.sections.categories.eyebrow}
            onChange={(v) => updateSection('categories', { eyebrow: v })} />
          
            <TextField
            label="Title"
            value={content.sections.categories.title}
            onChange={(v) => updateSection('categories', { title: v })} />
          
            <TextAreaField
            label="Subtitle"
            value={content.sections.categories.subtitle}
            onChange={(v) => updateSection('categories', { subtitle: v })} />
          
          </div>
          <ItemList
          title="Categories"
          addLabel="Add category"
          items={content.sections.categories.items}
          onChange={(items) => updateSection('categories', { items })}
          itemTitle={(item) => item.title}
          createItem={() => ({ id: uid('cat'), title: 'New category', caption: '0 designs', image: '' })}
          renderItem={(item, update) =>
          <>
                <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <TextField label="Caption" value={item.caption} onChange={(v) => update({ caption: v })} />
                <ImageField label="Image" value={item.image} onChange={(v) => update({ image: v })} />
              </>
          } />
        
        </>
      }

      {id === 'featured' &&
      <>
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <TextField
            label="Eyebrow"
            value={content.sections.featured.eyebrow}
            onChange={(v) => updateSection('featured', { eyebrow: v })} />
          
            <TextField
            label="Title"
            value={content.sections.featured.title}
            onChange={(v) => updateSection('featured', { title: v })} />
          
            <TextAreaField
            label="Subtitle"
            value={content.sections.featured.subtitle}
            onChange={(v) => updateSection('featured', { subtitle: v })} />
          
            <TextField
            label="Enquiry button label"
            value={content.sections.featured.enquiryLabel}
            onChange={(v) => updateSection('featured', { enquiryLabel: v })}
            hint="Shown on every product card. Prices are not displayed — customers enquire instead." />

            <TextField
            label="Trust badges"
            value={content.sections.featured.trustBadges}
            onChange={(v) => updateSection('featured', { trustBadges: v })}
            hint="Comma separated, shown in the quick view — e.g. BIS Hallmarked, Certified" />

          </div>
          <ItemList
          title="Products"
          addLabel="Add product"
          items={content.sections.featured.items}
          onChange={(items) => updateSection('featured', { items })}
          itemTitle={(item) => item.name}
          createItem={() => ({
            id: uid('p'),
            name: 'New product',
            metal: '18K Gold',
            price: '',
            compareAt: '',
            badge: '',
            image: '',
            specs: 'Purity: 22K BIS Hallmarked\nGross weight: \nAvailable sizes: '
          })}
          emptyText="No products. Add one to fill the grid."
          renderItem={(item, update) =>
          <>
                <TextField label="Name" value={item.name} onChange={(v) => update({ name: v })} />
                <TextField label="Metal / details" value={item.metal} onChange={(v) => update({ metal: v })} />
                <TextField
              label="Badge"
              value={item.badge}
              onChange={(v) => update({ badge: v })}
              hint="Optional corner label, e.g. Bestseller" />

                <TextAreaField
              label="Specifications"
              value={item.specs}
              onChange={(v) => update({ specs: v })}
              placeholder={'Purity: 22K BIS Hallmarked\nGross weight: 18.6 g\nAvailable sizes: 2.4 to 2.8'}
              hint="One per line as “Label: Value”. Shown in the quick view. Leave empty to hide." />

                <ImageField label="Product image" value={item.image} onChange={(v) => update({ image: v })} />
              </>
          } />
        
        </>
      }

      {id === 'promo' &&
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <TextField
          label="Eyebrow"
          value={content.sections.promo.eyebrow}
          onChange={(v) => updateSection('promo', { eyebrow: v })} />
        
          <TextField
          label="Title"
          value={content.sections.promo.title}
          onChange={(v) => updateSection('promo', { title: v })} />
        
          <TextAreaField
          label="Body"
          value={content.sections.promo.body}
          onChange={(v) => updateSection('promo', { body: v })} />
        
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
            label="Button label"
            value={content.sections.promo.ctaLabel}
            onChange={(v) => updateSection('promo', { ctaLabel: v })} />
          
            <TextField
            label="Coupon code"
            value={content.sections.promo.couponCode}
            onChange={(v) => updateSection('promo', { couponCode: v })}
            hint="Leave empty to hide" />
          
          </div>
          <ImageField
          label="Banner image"
          value={content.sections.promo.image}
          onChange={(v) => updateSection('promo', { image: v })} />
        
        </div>
      }

      {id === 'trust' &&
      <>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <TextField
            label="Title"
            value={content.sections.trust.title}
            onChange={(v) => updateSection('trust', { title: v })}
            hint="Leave empty to hide the heading" />
          
          </div>
          <ItemList
          title="Promises"
          addLabel="Add promise"
          items={content.sections.trust.items}
          onChange={(items) => updateSection('trust', { items })}
          itemTitle={(item) => item.title}
          createItem={() => ({ id: uid('t'), icon: 'gem' as IconKey, title: 'New promise', text: 'Describe it here.' })}
          renderItem={(item, update) =>
          <>
                <SelectField
              label="Icon"
              value={item.icon}
              onChange={(v) => update({ icon: v as IconKey })}
              options={ICON_OPTIONS} />
            
                <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <TextAreaField label="Text" value={item.text} onChange={(v) => update({ text: v })} />
              </>
          } />
        
        </>
      }

      {id === 'testimonials' &&
      <>
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <TextField
            label="Eyebrow"
            value={content.sections.testimonials.eyebrow}
            onChange={(v) => updateSection('testimonials', { eyebrow: v })} />
          
            <TextField
            label="Title"
            value={content.sections.testimonials.title}
            onChange={(v) => updateSection('testimonials', { title: v })} />
          
          </div>
          <ItemList
          title="Reviews"
          addLabel="Add review"
          items={content.sections.testimonials.items}
          onChange={(items) => updateSection('testimonials', { items })}
          itemTitle={(item) => item.name}
          createItem={() => ({
            id: uid('r'),
            quote: 'What the customer said.',
            name: 'Customer name',
            location: 'City',
            rating: 5
          })}
          renderItem={(item, update) =>
          <>
                <TextAreaField label="Quote" value={item.quote} onChange={(v) => update({ quote: v })} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <TextField label="Name" value={item.name} onChange={(v) => update({ name: v })} />
                  <TextField label="Location" value={item.location} onChange={(v) => update({ location: v })} />
                  <SelectField
                label="Rating"
                value={String(item.rating)}
                onChange={(v) => update({ rating: Number(v) })}
                options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} stars` }))} />
              
                </div>
              </>
          } />
        
        </>
      }

      {id === 'editorial' &&
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <TextField
          label="Eyebrow"
          value={content.sections.editorial.eyebrow}
          onChange={(v) => updateSection('editorial', { eyebrow: v })} />
        
          <TextField
          label="Title"
          value={content.sections.editorial.title}
          onChange={(v) => updateSection('editorial', { title: v })} />
        
          <TextAreaField
          label="Body"
          value={content.sections.editorial.body}
          onChange={(v) => updateSection('editorial', { body: v })} />
        
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
            label="Stat 1 value"
            value={content.sections.editorial.stat1Value}
            onChange={(v) => updateSection('editorial', { stat1Value: v })} />
          
            <TextField
            label="Stat 1 label"
            value={content.sections.editorial.stat1Label}
            onChange={(v) => updateSection('editorial', { stat1Label: v })} />
          
            <TextField
            label="Stat 2 value"
            value={content.sections.editorial.stat2Value}
            onChange={(v) => updateSection('editorial', { stat2Value: v })} />
          
            <TextField
            label="Stat 2 label"
            value={content.sections.editorial.stat2Label}
            onChange={(v) => updateSection('editorial', { stat2Label: v })} />
          
          </div>
          <TextField
          label="Link label"
          value={content.sections.editorial.ctaLabel}
          onChange={(v) => updateSection('editorial', { ctaLabel: v })} />
        
          <ImageField
          label="Image"
          value={content.sections.editorial.image}
          onChange={(v) => updateSection('editorial', { image: v })} />
        
        </div>
      }

      {id === 'contact' &&
      <>
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <TextField
            label="Eyebrow"
            value={content.sections.contact.eyebrow}
            onChange={(v) => updateSection('contact', { eyebrow: v })} />

            <TextField
            label="Title"
            value={content.sections.contact.title}
            onChange={(v) => updateSection('contact', { title: v })} />

            <TextAreaField
            label="Subtitle"
            value={content.sections.contact.subtitle}
            onChange={(v) => updateSection('contact', { subtitle: v })} />

          </div>

          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Contact details
            </p>
            <TextAreaField
            label="Address"
            value={content.sections.contact.address}
            onChange={(v) => updateSection('contact', { address: v })}
            hint="Leave empty to hide" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
              label="Phone"
              value={content.sections.contact.phone}
              onChange={(v) => updateSection('contact', { phone: v })}
              hint="Leave empty to hide" />

              <TextField
              label="Email"
              value={content.sections.contact.email}
              onChange={(v) => updateSection('contact', { email: v })}
              hint="Leave empty to hide" />

              <TextField
              label="Opening hours"
              value={content.sections.contact.hours}
              onChange={(v) => updateSection('contact', { hours: v })}
              hint="Leave empty to hide" />

              <TextField
              label="WhatsApp number"
              value={content.sections.contact.whatsapp}
              onChange={(v) => updateSection('contact', { whatsapp: v })}
              hint="Leave empty to hide the chat button" />

            </div>
            <TextField
            label="Google Maps embed URL"
            value={content.sections.contact.mapEmbedUrl}
            onChange={(v) => updateSection('contact', { mapEmbedUrl: v })}
            placeholder="https://www.google.com/maps/embed?pb=…"
            hint="Google Maps → Share → Embed a map → copy the src URL. Leave empty to hide the map." />

            <ToggleField
            label="Show social links here"
            description="Uses the same links as the footer, edited in Brand, header & footer."
            checked={content.sections.contact.showSocial}
            onChange={(value) => updateSection('contact', { showSocial: value })} />

          </div>

          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Enquiry form
            </p>
            <ToggleField
            label="Show the contact form"
            description="Messages are stored on the server and appear in the Contact messages tab."
            checked={content.sections.contact.showForm}
            onChange={(value) => updateSection('contact', { showForm: value })} />

            {content.sections.contact.showForm &&
          <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                label="Form title"
                value={content.sections.contact.formTitle}
                onChange={(v) => updateSection('contact', { formTitle: v })} />

                  <TextField
                label="Button label"
                value={content.sections.contact.formCtaLabel}
                onChange={(v) => updateSection('contact', { formCtaLabel: v })} />

                </div>
                <TextField
              label="Fine print"
              value={content.sections.contact.formNote}
              onChange={(v) => updateSection('contact', { formNote: v })} />

                <TextAreaField
              label="Thank-you message"
              value={content.sections.contact.successMessage}
              onChange={(v) => updateSection('contact', { successMessage: v })}
              hint="Shown after a message is sent successfully." />

              </>
          }
          </div>
        </>
      }

      {id === 'newsletter' &&
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <TextField
          label="Title"
          value={content.sections.newsletter.title}
          onChange={(v) => updateSection('newsletter', { title: v })} />
        
          <TextAreaField
          label="Body"
          value={content.sections.newsletter.body}
          onChange={(v) => updateSection('newsletter', { body: v })} />
        
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
            label="Button label"
            value={content.sections.newsletter.ctaLabel}
            onChange={(v) => updateSection('newsletter', { ctaLabel: v })} />
          
            <TextField
            label="Fine print"
            value={content.sections.newsletter.note}
            onChange={(v) => updateSection('newsletter', { note: v })} />
          
          </div>
        </div>
      }

      {id === 'gallery' &&
      <>
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <TextField
            label="Eyebrow"
            value={content.sections.gallery.eyebrow}
            onChange={(v) => updateSection('gallery', { eyebrow: v })} />
          
            <TextField
            label="Title"
            value={content.sections.gallery.title}
            onChange={(v) => updateSection('gallery', { title: v })} />
          
            <TextField
            label="Social handle"
            value={content.sections.gallery.handle}
            onChange={(v) => updateSection('gallery', { handle: v })}
            hint="Leave empty to hide" />
          
          </div>
          <ItemList
          title="Photos"
          addLabel="Add photo"
          items={content.sections.gallery.items}
          onChange={(items) => updateSection('gallery', { items })}
          itemTitle={(item, index) => item.caption || `Photo ${index + 1}`}
          createItem={() => ({ id: uid('g'), image: '', caption: '' })}
          emptyText="No photos yet."
          renderItem={(item, update) =>
          <>
                <ImageField label="Photo" value={item.image} onChange={(v) => update({ image: v })} />
                <TextField label="Caption" value={item.caption} onChange={(v) => update({ caption: v })} />
              </>
          } />
        
        </>
      }

      {id === 'journal' &&
      <>
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <TextField
            label="Eyebrow"
            value={content.sections.journal.eyebrow}
            onChange={(v) => updateSection('journal', { eyebrow: v })} />
          
            <TextField
            label="Title"
            value={content.sections.journal.title}
            onChange={(v) => updateSection('journal', { title: v })} />
          
            <TextAreaField
            label="Subtitle"
            value={content.sections.journal.subtitle}
            onChange={(v) => updateSection('journal', { subtitle: v })} />
          
            <TextField
            label="Bottom link"
            value={content.sections.journal.ctaLabel}
            onChange={(v) => updateSection('journal', { ctaLabel: v })}
            hint="Leave empty to hide" />
          
          </div>
          <ItemList
          title="Posts"
          addLabel="Add post"
          items={content.sections.journal.items}
          onChange={(items) => updateSection('journal', { items })}
          itemTitle={(item) => item.title}
          createItem={() => ({
            id: uid('j'),
            title: 'New story title',
            excerpt: 'A one-line summary of the story.',
            category: 'Guide',
            date: 'Today',
            readTime: '5 min read',
            image: ''
          })}
          emptyText="No posts yet."
          renderItem={(item, update) =>
          <>
                <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <TextAreaField label="Excerpt" value={item.excerpt} onChange={(v) => update({ excerpt: v })} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <TextField label="Category" value={item.category} onChange={(v) => update({ category: v })} />
                  <TextField label="Date" value={item.date} onChange={(v) => update({ date: v })} />
                  <TextField label="Read time" value={item.readTime} onChange={(v) => update({ readTime: v })} />
                </div>
                <ImageField label="Cover image" value={item.image} onChange={(v) => update({ image: v })} />
              </>
          } />
        
        </>
      }

      {id === 'faq' &&
      <>
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <TextField
            label="Eyebrow"
            value={content.sections.faq.eyebrow}
            onChange={(v) => updateSection('faq', { eyebrow: v })} />
          
            <TextField
            label="Title"
            value={content.sections.faq.title}
            onChange={(v) => updateSection('faq', { title: v })} />
          
          </div>
          <ItemList
          title="Questions"
          addLabel="Add question"
          items={content.sections.faq.items}
          onChange={(items) => updateSection('faq', { items })}
          itemTitle={(item) => item.question}
          createItem={() => ({ id: uid('q'), question: 'New question?', answer: 'The answer goes here.' })}
          emptyText="No questions yet."
          renderItem={(item, update) =>
          <>
                <TextField label="Question" value={item.question} onChange={(v) => update({ question: v })} />
                <TextAreaField label="Answer" value={item.answer} onChange={(v) => update({ answer: v })} />
              </>
          } />
        
        </>
      }
    </div>);

}
import { useContent } from '../../hooks/useContent';
import { ImageField, SliderField, TextAreaField, TextField, ToggleField } from './Fields';
import { ItemList } from './ItemList';
import { uid } from '../../utils/id';

export function GlobalEditor() {
  const { content, updateBrand, updateNav, updateAnnouncement, updateFooter, updateSeo } = useContent();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald">Site wide</p>
        <h2 className="mt-1 text-2xl font-medium text-slate-900">Brand, header & footer</h2>
      </header>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Brand</h3>
        <TextField label="Store name" value={content.brand.name} onChange={(v) => updateBrand({ name: v })} />
        <TextField label="Tagline" value={content.brand.tagline} onChange={(v) => updateBrand({ tagline: v })} />
        <TextField label="Phone" value={content.brand.phone} onChange={(v) => updateBrand({ phone: v })} />
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Logo</h3>
        <p className="-mt-2 text-xs text-slate-500">
          Your logo can appear in three places: at the start of the header, in the Contact section and in
          the footer. Leave one empty to hide it there — the store name always stays as the centred header
          wordmark. Uploads accept JPG, PNG, WebP, GIF and AVIF up to 8&nbsp;MB.
        </p>

        <div className="space-y-4">
          <ImageField
            label="Logo (header, left side)"
            value={content.brand.headerLogo}
            onChange={(v) => updateBrand({ headerLogo: v })} />

          <SliderField
            label="Header logo height"
            value={content.brand.headerLogoHeight}
            onChange={(v) => updateBrand({ headerLogoHeight: v })}
            min={24}
            max={64}
            hint="The bar grows to 92px for a logo, so 44–56px sits well with room to breathe." />
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <ImageField
            label="Logo (Contact section)"
            value={content.brand.logo}
            onChange={(v) => updateBrand({ logo: v })} />

          <SliderField
            label="Contact logo height"
            value={content.brand.logoHeight}
            onChange={(v) => updateBrand({ logoHeight: v })}
            min={40}
            max={160}
            hint="Shown on a white card beside your address and phone — 90–120px suits most logos." />
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <ImageField
            label="Footer logo"
            value={content.brand.footerLogo}
            onChange={(v) => updateBrand({ footerLogo: v })} />

          <SliderField
            label="Footer logo height"
            value={content.brand.footerLogoHeight}
            onChange={(v) => updateBrand({ footerLogoHeight: v })}
            min={24}
            max={120}
            hint="The footer is dark, so the logo sits on a light plaque — any version works." />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Search & sharing (SEO)
        </h3>
        <TextField
          label="Page title"
          value={content.seo.title}
          onChange={(v) => updateSeo({ title: v })}
          hint="Shows in the browser tab and Google results" />
        
        <TextAreaField
          label="Meta description"
          value={content.seo.description}
          onChange={(v) => updateSeo({ description: v })}
          hint="Aim for 150–160 characters" />
        
        <TextField
          label="Keywords"
          value={content.seo.keywords}
          onChange={(v) => updateSeo({ keywords: v })}
          hint="Comma separated" />
        
        <TextField
          label="Share image URL"
          value={content.seo.ogImage}
          onChange={(v) => updateSeo({ ogImage: v })}
          hint="Used when the link is shared on social or WhatsApp" />
        
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Announcement bar
        </h3>
        <ToggleField
          label={content.announcement.visible ? 'Bar is visible' : 'Bar is hidden'}
          checked={content.announcement.visible}
          onChange={(value) => updateAnnouncement({ visible: value })} />
        
        <TextField
          label="Message"
          value={content.announcement.message}
          onChange={(v) => updateAnnouncement({ message: v })} />
        
        <TextField
          label="Link label"
          value={content.announcement.linkLabel}
          onChange={(v) => updateAnnouncement({ linkLabel: v })}
          hint="Leave empty to hide the link" />
        
      </div>

      <ItemList
        title="Header menu"
        addLabel="Add link"
        items={content.nav}
        onChange={updateNav}
        itemTitle={(item) => item.label}
        createItem={() => ({ id: uid('nav'), label: 'New link', href: '#featured' })}
        renderItem={(item, update) =>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Label" value={item.label} onChange={(v) => update({ label: v })} />
            <TextField
            label="Link target"
            value={item.href}
            onChange={(v) => update({ href: v })}
            hint="e.g. #featured or /admin" />
          
          </div>
        } />
      

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Footer</h3>
        <TextAreaField label="About text" value={content.footer.about} onChange={(v) => updateFooter({ about: v })} />
        <TextField
          label="Copyright"
          value={content.footer.copyright}
          onChange={(v) => updateFooter({ copyright: v })} />
        
      </div>

      <ItemList
        title="Footer columns"
        addLabel="Add column"
        items={content.footer.columns}
        onChange={(columns) => updateFooter({ columns })}
        itemTitle={(item) => item.title}
        createItem={() => ({ id: uid('fc'), title: 'New column', links: [] })}
        renderItem={(column, updateColumn) =>
        <>
            <TextField label="Column title" value={column.title} onChange={(v) => updateColumn({ title: v })} />
            <ItemList
            title="Links"
            addLabel="Add link"
            items={column.links}
            onChange={(links) => updateColumn({ links })}
            itemTitle={(link) => link.label}
            createItem={() => ({ id: uid('fl'), label: 'New link', href: '#top' })}
            emptyText="No links in this column."
            renderItem={(link, updateLink) =>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField label="Label" value={link.label} onChange={(v) => updateLink({ label: v })} />
                  <TextField label="Link target" value={link.href} onChange={(v) => updateLink({ href: v })} />
                </div>
            } />

          </>
        } />

      <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Social & media links (Instagram, Facebook, YouTube, X, LinkedIn, email…) have their own tab —
        see <span className="font-medium text-slate-700">Social &amp; media links</span> in the sidebar.
      </p>
    </div>);

}
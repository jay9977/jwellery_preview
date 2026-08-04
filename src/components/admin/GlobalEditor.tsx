import { useContent } from '../../contexts/ContentContext';
import { TextAreaField, TextField, ToggleField } from './Fields';
import { ItemList } from './ItemList';

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;

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
      
    </div>);

}
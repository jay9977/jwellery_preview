/**
 * Small window events used to talk between sections that are not parent and child:
 * a search result opening a product, or a product sending the visitor to the enquiry
 * form. Keeps Featured, QuickView, Contact and the header search independent of each
 * other — no shared state, no prop drilling through the page.
 */

const QUICK_VIEW = 'girija:quickview';
const ENQUIRY = 'girija:enquiry';

/** Ask the Featured section to open the quick view for a product id. */
export function openQuickView(productId: string) {
  window.dispatchEvent(new CustomEvent<string>(QUICK_VIEW, { detail: productId }));
}

export function onQuickView(handler: (productId: string) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<string>).detail);
  window.addEventListener(QUICK_VIEW, listener);
  return () => window.removeEventListener(QUICK_VIEW, listener);
}

/** Send the visitor to the Contact form with the piece they asked about filled in. */
export function startEnquiry(productName: string) {
  window.dispatchEvent(new CustomEvent<string>(ENQUIRY, { detail: productName }));
}

export function onEnquiry(handler: (productName: string) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<string>).detail);
  window.addEventListener(ENQUIRY, listener);
  return () => window.removeEventListener(ENQUIRY, listener);
}

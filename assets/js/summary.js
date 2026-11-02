// Order summary box, shared by the cart and checkout pages.
import { formatPrice, FREE_SHIPPING_FROM } from './cart.js';

export function summaryHtml(t, { showProgress = true } = {}) {
  const pct = Math.min(100, Math.round(((FREE_SHIPPING_FROM - t.toFreeShipping) / FREE_SHIPPING_FROM) * 100));
  return `
    ${showProgress ? `<p style="margin:0;font-size:.9rem">${
      t.toFreeShipping > 0
        ? `You're <strong>${formatPrice(t.toFreeShipping)}</strong> away from free UK delivery.`
        : 'You qualify for <strong>free UK delivery</strong>.'
    }</p>
    <div class="progress" aria-hidden="true"><span style="width:${pct}%"></span></div>` : ''}
    <div class="row"><span>Subtotal</span><span>${formatPrice(t.subtotal)}</span></div>
    ${t.discount ? `<div class="row"><span>Discount (WELCOME10)</span><span>−${formatPrice(t.discount)}</span></div>` : ''}
    <div class="row"><span>Delivery</span><span>${t.shipping ? formatPrice(t.shipping) : 'Free'}</span></div>
    <div class="row total"><strong>Total</strong><strong>${formatPrice(t.total)}</strong></div>`;
}

const PROMO_KEY = 'synth-promo-v1';
export const getPromo = () => {
  try {
    return localStorage.getItem(PROMO_KEY) || '';
  } catch {
    return '';
  }
};
export const setPromo = (code) => {
  try {
    if (code) localStorage.setItem(PROMO_KEY, code);
    else localStorage.removeItem(PROMO_KEY);
  } catch {
    /* ignore */
  }
};

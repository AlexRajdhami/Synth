// Cart logic: pure functions (easy to test) plus a small localStorage wrapper.

export const FREE_SHIPPING_FROM = 75;
export const SHIPPING_COST = 4.95;
export const MAX_QTY = 10;
export const PROMO_CODES = { WELCOME10: 0.1 };

const STORAGE_KEY = 'synth-cart-v1';

const clampQty = (qty) => Math.max(1, Math.min(MAX_QTY, Math.floor(Number(qty) || 1)));
const sameLine = (a, b) => a.id === b.id && a.size === b.size;

export function addItem(items, { id, size, qty = 1 }) {
  if (!id || !size) throw new Error('Product and size are required');
  const existing = items.find((line) => sameLine(line, { id, size }));
  if (existing) {
    return items.map((line) =>
      sameLine(line, { id, size }) ? { ...line, qty: clampQty(line.qty + Number(qty)) } : line
    );
  }
  return [...items, { id, size, qty: clampQty(qty) }];
}

export function updateQty(items, { id, size }, qty) {
  if (Number(qty) <= 0) return removeItem(items, { id, size });
  return items.map((line) => (sameLine(line, { id, size }) ? { ...line, qty: clampQty(qty) } : line));
}

export function removeItem(items, { id, size }) {
  return items.filter((line) => !sameLine(line, { id, size }));
}

export function itemCount(items) {
  return items.reduce((sum, line) => sum + line.qty, 0);
}

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Work out the order totals.
 * @param items  cart lines [{id, size, qty}]
 * @param findProduct  function(id) -> product with a price
 * @param promoCode  optional code, e.g. "WELCOME10"
 */
export function totals(items, findProduct, promoCode = '') {
  const lines = items
    .map((line) => ({ ...line, product: findProduct(line.id) }))
    .filter((line) => line.product);
  const subtotal = round2(lines.reduce((sum, l) => sum + l.product.price * l.qty, 0));
  const rate = PROMO_CODES[String(promoCode).trim().toUpperCase()] || 0;
  const discount = round2(subtotal * rate);
  const afterDiscount = subtotal - discount;
  const shipping = lines.length === 0 || afterDiscount >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
  return {
    lines,
    subtotal,
    discount,
    shipping,
    total: round2(afterDiscount + shipping),
    promoApplied: rate > 0,
    toFreeShipping: lines.length === 0 ? FREE_SHIPPING_FROM : round2(Math.max(0, FREE_SHIPPING_FROM - afterDiscount)),
  };
}

export const formatPrice = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);

// ---- Storage (works without localStorage, e.g. in private windows) ----

export function loadCart(storage = globalThis.localStorage) {
  try {
    const data = JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data.filter((l) => l && l.id && l.size && l.qty > 0) : [];
  } catch {
    return [];
  }
}

export function saveCart(items, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable – cart lasts for this page only */
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cart:change'));
  return items;
}

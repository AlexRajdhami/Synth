// Small shared helpers
export { imageUrl } from './products.js';
export { formatPrice as formatPriceSafe } from './cart.js';

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const params = () => new URLSearchParams(location.search);

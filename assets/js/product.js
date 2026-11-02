import { productCard, bindWishButtons, getWishlist, toggleWish, toast, icons } from './layout.js';
import { PRODUCTS, getProduct, imageUrl } from './products.js';
import { addItem, loadCart, saveCart, formatPrice, MAX_QTY, FREE_SHIPPING_FROM } from './cart.js';
import { escapeHtml, params } from './helpers.js';

const root = document.querySelector('[data-product]');
const product = getProduct(params().get('id'));

if (!product) {
  document.title = 'Product not found – Synth';
  root.innerHTML = `
    <div class="empty">
      <h1>Product not found</h1>
      <p>This product may have sold out or the link is wrong.</p>
      <a class="btn" href="shop.html">Back to the shop</a>
    </div>`;
} else {
  render(product);
}

function render(p) {
  document.title = `${p.name} – ${p.colour} – Synth`;
  document.querySelector('meta[name="description"]').content = p.description;
  const wished = getWishlist().includes(p.id);

  root.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a> / <a href="shop.html?category=${encodeURIComponent(p.category)}">${p.category}</a> / <span aria-current="page">${escapeHtml(p.name)}</span>
    </nav>
    <div class="product">
      <div class="media"><img src="${imageUrl(p, 1200)}" alt="${escapeHtml(p.name)} in ${escapeHtml(p.colour)}" width="1200" height="1500"></div>
      <div>
        <p class="eyebrow">${p.category}${p.isNew ? ' · New' : ''}</p>
        <h1 style="font-size:clamp(1.8rem,3vw,2.6rem)">${escapeHtml(p.name)}</h1>
        <p class="muted" style="margin-top:-8px">${escapeHtml(p.colour)}</p>
        <p class="price">${formatPrice(p.price)}</p>
        <p>${escapeHtml(p.description)}</p>

        <form data-add novalidate>
          <fieldset>
            <legend style="margin:16px 0 0">Size</legend>
            <div class="sizes">
              ${p.sizes.map((s) => `<label class="size"><input type="radio" name="size" value="${s}"><span>${s}</span></label>`).join('')}
            </div>
            <p class="error-text" data-size-error role="alert"></p>
          </fieldset>
          <div class="buy-row">
            <div class="qty">
              <button type="button" data-step="-1" aria-label="Decrease quantity">−</button>
              <input type="number" name="qty" value="1" min="1" max="${MAX_QTY}" aria-label="Quantity">
              <button type="button" data-step="1" aria-label="Increase quantity">+</button>
            </div>
            <button class="btn" type="submit">Add to bag</button>
            <button class="icon-btn" type="button" data-wish-toggle aria-pressed="${wished}" aria-label="${wished ? 'Remove from' : 'Add to'} wishlist" style="border:1px solid #cfcfcf;width:48px;height:48px">${icons.heart}</button>
          </div>
        </form>
        <p class="muted" style="font-size:.9rem">Free UK delivery on orders over ${formatPrice(FREE_SHIPPING_FROM)} · 30-day returns</p>

        <details class="details" open><summary>Details</summary><ul>${p.details.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul></details>
        <details class="details"><summary>Delivery & returns</summary><ul>
          <li>Standard UK delivery: 2–4 working days</li><li>Free returns within 30 days</li></ul></details>
        <p class="credit">Photo by <a href="${p.credit.url}?utm_source=synth&utm_medium=referral" target="_blank" rel="noopener">${escapeHtml(p.credit.name)}</a> on <a href="https://unsplash.com/?utm_source=synth&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a></p>
      </div>
    </div>`;

  const form = root.querySelector('[data-add]');
  const qty = form.querySelector('input[name="qty"]');
  const sizeError = form.querySelector('[data-size-error]');

  form.addEventListener('click', (e) => {
    const step = e.target.closest('[data-step]');
    if (!step) return;
    qty.value = Math.max(1, Math.min(MAX_QTY, Number(qty.value || 1) + Number(step.dataset.step)));
  });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'size') sizeError.textContent = '';
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const size = form.querySelector('input[name="size"]:checked')?.value;
    if (!size) {
      sizeError.textContent = 'Please choose a size.';
      form.querySelector('input[name="size"]').focus();
      return;
    }
    saveCart(addItem(loadCart(), { id: p.id, size, qty: Number(qty.value) || 1 }));
    toast(`Added ${p.name} (size ${size}) to your bag.`, { href: 'cart.html', label: 'View bag' });
  });
  root.querySelector('[data-wish-toggle]').addEventListener('click', (e) => {
    const on = toggleWish(p.id);
    e.currentTarget.setAttribute('aria-pressed', String(on));
    e.currentTarget.setAttribute('aria-label', `${on ? 'Remove from' : 'Add to'} wishlist`);
    toast(on ? 'Saved to your wishlist.' : 'Removed from your wishlist.');
  });

  const related = PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category)
    .concat(PRODUCTS.filter((x) => x.id !== p.id && x.category !== p.category))
    .slice(0, 4);
  const relatedEl = document.querySelector('[data-related]');
  relatedEl.innerHTML = related.map(productCard).join('');
  document.querySelector('[data-related-section]').hidden = false;
  bindWishButtons(relatedEl);
}

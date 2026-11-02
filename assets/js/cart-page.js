import { toast } from './layout.js';
import { getProduct, imageUrl } from './products.js';
import { loadCart, saveCart, updateQty, removeItem, totals, formatPrice, MAX_QTY, PROMO_CODES } from './cart.js';
import { summaryHtml, getPromo, setPromo } from './summary.js';
import { escapeHtml } from './helpers.js';

const root = document.querySelector('[data-cart]');

function render() {
  const items = loadCart();
  const t = totals(items, getProduct, getPromo());

  if (!t.lines.length) {
    root.innerHTML = `
      <div class="empty">
        <p>Your bag is empty.</p>
        <a class="btn" href="shop.html">Start shopping</a>
      </div>`;
    return;
  }

  root.innerHTML = `
    <div class="layout-2">
      <section aria-label="Items in your bag">
        ${t.lines.map((l) => `
          <div class="cart-line" data-id="${l.id}" data-size="${escapeHtml(l.size)}">
            <a href="product.html?id=${encodeURIComponent(l.id)}"><img src="${imageUrl(l.product, 300)}" alt="${escapeHtml(l.product.name)}" loading="lazy"></a>
            <div>
              <h3><a href="product.html?id=${encodeURIComponent(l.id)}" style="text-decoration:none">${escapeHtml(l.product.name)}</a></h3>
              <p class="muted" style="margin:0;font-size:.9rem">${escapeHtml(l.product.colour)} · Size ${escapeHtml(l.size)}</p>
              <div class="controls">
                <label class="field-inline">Qty
                  <select class="input" data-qty style="width:auto;min-width:72px">
                    ${Array.from({ length: MAX_QTY }, (_, i) => i + 1)
                      .map((n) => `<option value="${n}"${n === l.qty ? ' selected' : ''}>${n}</option>`).join('')}
                  </select>
                </label>
                <button class="link" type="button" data-remove>Remove</button>
              </div>
            </div>
            <strong>${formatPrice(l.product.price * l.qty)}</strong>
          </div>`).join('')}
        <p style="margin-top:24px"><a class="link" href="shop.html">← Continue shopping</a></p>
      </section>

      <aside class="summary" aria-label="Order summary">
        <h2 style="font-size:1.2rem">Order summary</h2>
        ${summaryHtml(t)}
        <form class="promo" data-promo novalidate>
          <label for="promo" class="visually-hidden">Promo code</label>
          <input id="promo" class="input" placeholder="Promo code" value="${escapeHtml(getPromo())}" autocomplete="off">
          <button class="btn btn--ghost" type="submit">${t.promoApplied ? 'Update' : 'Apply'}</button>
        </form>
        <a class="btn btn--block" href="checkout.html">Checkout</a>
        <p class="muted" style="font-size:.8rem;margin:12px 0 0;text-align:center">Demo store – no payment is taken.</p>
      </aside>
    </div>`;
}

root.addEventListener('change', (e) => {
  if (!e.target.matches('[data-qty]')) return;
  const line = e.target.closest('.cart-line');
  saveCart(updateQty(loadCart(), { id: line.dataset.id, size: line.dataset.size }, Number(e.target.value)));
  render();
});

root.addEventListener('click', (e) => {
  if (!e.target.matches('[data-remove]')) return;
  const line = e.target.closest('.cart-line');
  const name = line.querySelector('h3').textContent;
  saveCart(removeItem(loadCart(), { id: line.dataset.id, size: line.dataset.size }));
  render();
  toast(`Removed ${name} from your bag.`);
});

root.addEventListener('submit', (e) => {
  if (!e.target.matches('[data-promo]')) return;
  e.preventDefault();
  const code = e.target.querySelector('input').value.trim().toUpperCase();
  if (!code) {
    setPromo('');
    render();
    return;
  }
  if (PROMO_CODES[code]) {
    setPromo(code);
    render();
    toast(`Code ${code} applied: ${PROMO_CODES[code] * 100}% off.`);
  } else {
    toast('Sorry, that code is not valid.');
  }
});

render();

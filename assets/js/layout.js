// Shared header, footer, cart badge, mobile menu, toast and wishlist.
import { loadCart, itemCount } from './cart.js';
import { imageUrl, formatPriceSafe } from './helpers.js';

const icons = {
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9-8.5C1.6 8.4 3.6 5 7 5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.4 0 5.4 3.4 4 6.5C19 15.6 12 20 12 20z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/></svg>',
};
export { icons };

const NAV = [
  ['index.html', 'Home'],
  ['shop.html', 'Shop'],
  ['shop.html?filter=new', 'New In'],
  ['about.html', 'About'],
  ['contact.html', 'Contact'],
];

function currentPage() {
  const file = location.pathname.split('/').pop() || 'index.html';
  return file + (location.search.includes('filter=new') ? '?filter=new' : '');
}

function renderHeader() {
  const el = document.querySelector('[data-header]');
  if (!el) return;
  const here = currentPage();
  el.outerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="announce">Free UK delivery over £75 · Demo store – no real orders</div>
    <header class="site-header">
      <div class="container bar">
        <button class="icon-btn menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">${icons.menu}</button>
        <a href="index.html" class="logo" aria-label="Synth home">SYNTH</a>
        <nav id="site-nav" class="nav" aria-label="Main">
          ${NAV.map(([href, label]) => `<a href="${href}"${href === here ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
        </nav>
        <div class="header-actions">
          <a class="icon-btn" href="shop.html#search" aria-label="Search products">${icons.search}</a>
          <a class="icon-btn" href="shop.html?filter=wishlist" aria-label="Wishlist">${icons.heart}<span class="badge" data-wish-count hidden></span></a>
          <a class="icon-btn" href="cart.html" aria-label="Shopping bag">${icons.bag}<span class="badge" data-cart-count hidden></span></a>
        </div>
      </div>
    </header>`;

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
}

function renderFooter() {
  const el = document.querySelector('[data-footer]');
  if (!el) return;
  const year = new Date().getFullYear();
  el.outerHTML = `
    <section class="newsletter section" aria-labelledby="news-title">
      <div class="container split" style="align-items:center">
        <div>
          <p class="eyebrow" style="color:#bbb">Newsletter</p>
          <h2 id="news-title">10% off your first order</h2>
          <p style="opacity:.8">New drops, restocks and early access. Use code <strong>WELCOME10</strong> at checkout.</p>
        </div>
        <form class="news-form" novalidate>
          <label for="news-email" class="visually-hidden">Email address</label>
          <input id="news-email" class="input" type="email" placeholder="Your email address" autocomplete="email" required>
          <button class="btn btn--light" type="submit">Join</button>
        </form>
      </div>
    </section>
    <footer class="site-footer">
      <div class="container">
        <div class="cols">
          <div>
            <a href="index.html" class="logo">SYNTH</a>
            <p class="muted" style="margin-top:12px;max-width:320px">Considered essentials in black, white and everything in between. Designed to be worn for years.</p>
          </div>
          <div><h3>Shop</h3><ul>
            <li><a href="shop.html">All products</a></li>
            <li><a href="shop.html?filter=new">New in</a></li>
            <li><a href="shop.html?category=Outerwear">Outerwear</a></li>
            <li><a href="shop.html?category=Tops">Tops</a></li></ul></div>
          <div><h3>Help</h3><ul>
            <li><a href="contact.html">Contact us</a></li>
            <li><a href="about.html#delivery">Delivery & returns</a></li>
            <li><a href="about.html#sizing">Size guide</a></li></ul></div>
          <div><h3>Follow</h3><ul>
            <li><a href="https://github.com/AlexRajdhami/Synth" target="_blank" rel="noopener">GitHub</a></li>
            <li><a href="https://linkedin.com/in/alexrajdhami" target="_blank" rel="noopener">LinkedIn</a></li></ul></div>
        </div>
        <div class="legal">
          <span>© ${year} Synth · A portfolio project by Alex Rajdhami. Not a real shop – no payments are taken.</span>
          <span>Photos from <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></span>
        </div>
      </div>
    </footer>
    <div class="toast" role="status" aria-live="polite"></div>`;

  document.querySelector('.news-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) {
      input.setAttribute('aria-invalid', 'true');
      toast('Please enter a valid email address.');
      return;
    }
    input.removeAttribute('aria-invalid');
    e.target.reset();
    toast('Thanks for subscribing! Your code is WELCOME10.');
  });
}

// ---------- Badges ----------
export function updateBadges() {
  const count = itemCount(loadCart());
  const cartBadge = document.querySelector('[data-cart-count]');
  if (cartBadge) {
    cartBadge.textContent = count;
    cartBadge.hidden = count === 0;
  }
  const wishes = getWishlist().length;
  const wishBadge = document.querySelector('[data-wish-count]');
  if (wishBadge) {
    wishBadge.textContent = wishes;
    wishBadge.hidden = wishes === 0;
  }
}

// ---------- Toast ----------
let toastTimer;
export function toast(message, link) {
  const el = document.querySelector('.toast');
  if (!el) return;
  el.innerHTML = '';
  el.append(document.createTextNode(message));
  if (link) {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.label;
    el.append(a);
  }
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ---------- Wishlist ----------
const WISH_KEY = 'synth-wishlist-v1';
export function getWishlist() {
  try {
    const list = JSON.parse(localStorage.getItem(WISH_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
export function toggleWish(id) {
  const list = getWishlist();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  try {
    localStorage.setItem(WISH_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  updateBadges();
  return next.includes(id);
}

// ---------- Product card ----------
export function productCard(p) {
  const wished = getWishlist().includes(p.id);
  return `
    <article class="card">
      <button class="wish" type="button" data-wish="${p.id}" aria-pressed="${wished}" aria-label="${wished ? 'Remove from' : 'Add to'} wishlist: ${p.name}">${icons.heart}</button>
      <a href="product.html?id=${encodeURIComponent(p.id)}">
        <div class="media">
          <img src="${imageUrl(p, 600)}" alt="${p.name} in ${p.colour}" loading="lazy" width="600" height="800">
          ${p.isNew ? '<span class="tag">New</span>' : ''}
        </div>
        <div class="info">
          <div><h3 class="name">${p.name}</h3><p class="meta">${p.colour}</p></div>
          <span class="price">${formatPriceSafe(p.price)}</span>
        </div>
      </a>
    </article>`;
}

export function bindWishButtons(root = document) {
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-wish]');
    if (!btn) return;
    const on = toggleWish(btn.dataset.wish);
    btn.setAttribute('aria-pressed', String(on));
    const name = btn.getAttribute('aria-label').split(': ')[1];
    btn.setAttribute('aria-label', `${on ? 'Remove from' : 'Add to'} wishlist: ${name}`);
    toast(on ? 'Saved to your wishlist.' : 'Removed from your wishlist.');
    root.dispatchEvent(new CustomEvent('wishlist:change'));
  });
}

renderHeader();
renderFooter();
updateBadges();
window.addEventListener('cart:change', updateBadges);
window.addEventListener('storage', updateBadges);

import { productCard, bindWishButtons, getWishlist } from './layout.js';
import { PRODUCTS, CATEGORIES } from './products.js';

const els = {
  title: document.querySelector('[data-title]'),
  count: document.querySelector('[data-count]'),
  chips: document.querySelector('[data-chips]'),
  results: document.querySelector('[data-results]'),
  empty: document.querySelector('[data-empty]'),
  search: document.getElementById('search'),
  sort: document.getElementById('sort'),
};

const url = new URLSearchParams(location.search);
const state = {
  // "All", a category, "new" or "wishlist"
  filter: url.get('filter') || url.get('category') || 'All',
  q: url.get('q') || '',
  sort: url.get('sort') || 'featured',
};

const FILTERS = ['All', 'new', ...CATEGORIES, 'wishlist'];
const label = (f) => ({ All: 'All', new: 'New in', wishlist: 'Wishlist' }[f] || f);

function filtered() {
  const q = state.q.trim().toLowerCase();
  const wish = getWishlist();
  let list = PRODUCTS.filter((p) => {
    if (state.filter === 'new' && !p.isNew) return false;
    if (state.filter === 'wishlist' && !wish.includes(p.id)) return false;
    if (CATEGORIES.includes(state.filter) && p.category !== state.filter) return false;
    if (q && !`${p.name} ${p.colour} ${p.category} ${p.description}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const sorters = {
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name),
    new: (a, b) => Number(b.isNew) - Number(a.isNew),
    featured: (a, b) => Number(b.featured) - Number(a.featured),
  };
  return [...list].sort(sorters[state.sort] || sorters.featured);
}

function syncUrl() {
  const p = new URLSearchParams();
  if (state.filter === 'new' || state.filter === 'wishlist') p.set('filter', state.filter);
  else if (state.filter !== 'All') p.set('category', state.filter);
  if (state.q) p.set('q', state.q);
  if (state.sort !== 'featured') p.set('sort', state.sort);
  history.replaceState(null, '', `${location.pathname}${p.toString() ? '?' + p : ''}`);
}

function render() {
  els.chips.innerHTML = FILTERS.map(
    (f) => `<button type="button" class="chip" data-filter="${f}" aria-pressed="${state.filter === f}">${label(f)}</button>`
  ).join('');
  const list = filtered();
  els.title.textContent = state.filter === 'All' ? 'Shop all' : label(state.filter);
  document.title = `${els.title.textContent} – Synth`;
  els.count.textContent = `${list.length} ${list.length === 1 ? 'product' : 'products'}${
    state.q ? ` for “${state.q}”` : ''
  }`;
  els.results.innerHTML = list.map(productCard).join('');
  els.empty.hidden = list.length > 0;
  if (!list.length && state.filter === 'wishlist' && !state.q) {
    els.empty.querySelector('p').textContent = 'Your wishlist is empty. Tap the ♡ on any product to save it.';
  } else {
    els.empty.querySelector('p').textContent = 'No products match your search.';
  }
  syncUrl();
}

els.search.value = state.q;
els.sort.value = state.sort;
if (!FILTERS.includes(state.filter)) state.filter = 'All';

els.chips.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-filter]');
  if (!chip) return;
  state.filter = chip.dataset.filter;
  render();
});
let timer;
els.search.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    state.q = els.search.value;
    render();
  }, 150);
});
els.sort.addEventListener('change', () => {
  state.sort = els.sort.value;
  render();
});
document.querySelector('[data-reset]').addEventListener('click', () => {
  Object.assign(state, { filter: 'All', q: '', sort: 'featured' });
  els.search.value = '';
  els.sort.value = 'featured';
  render();
});
els.results.addEventListener('wishlist:change', () => {
  if (state.filter === 'wishlist') render();
});

bindWishButtons(els.results);
render();
if (location.hash === '#search') els.search.focus();

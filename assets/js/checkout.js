import './layout.js';
import { getProduct } from './products.js';
import { loadCart, saveCart, totals, formatPrice } from './cart.js';
import { summaryHtml, getPromo, setPromo } from './summary.js';
import { validate, showErrors, formatPostcode } from './validation.js';
import { escapeHtml } from './helpers.js';

const EXPRESS_FEE = 5;
const root = document.querySelector('[data-checkout]');
const form = document.getElementById('checkout-form');

const cartTotals = () => totals(loadCart(), getProduct, getPromo());

if (!cartTotals().lines.length) {
  root.innerHTML = `
    <div class="empty"><h1>Your bag is empty</h1>
      <p>Add something you love before checking out.</p>
      <a class="btn" href="shop.html">Go to the shop</a></div>`;
} else {
  renderSummary();
  form.addEventListener('change', (e) => {
    if (e.target.name === 'delivery') renderSummary();
  });
  form.postcode.addEventListener('blur', () => {
    if (form.postcode.value.trim()) form.postcode.value = formatPostcode(form.postcode.value);
  });
  form.addEventListener('submit', onSubmit);
}

function withDelivery(t) {
  const express = form.delivery.value === 'express';
  return express ? { ...t, shipping: t.shipping + EXPRESS_FEE, total: t.total + EXPRESS_FEE } : t;
}

function renderSummary() {
  const t = cartTotals();
  document.querySelector('[data-standard-price]').textContent = t.shipping ? formatPrice(t.shipping) : 'Free';
  document.querySelector('[data-lines]').innerHTML = t.lines
    .map((l) => `<div class="row" style="font-size:.9rem"><span>${escapeHtml(l.product.name)} · ${escapeHtml(l.size)} × ${l.qty}</span><span>${formatPrice(l.product.price * l.qty)}</span></div>`)
    .join('');
  document.querySelector('[data-summary]').innerHTML = summaryHtml(withDelivery(t), { showProgress: false });
}

function onSubmit(e) {
  e.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  const { valid, errors } = validate(values, {
    email: ['required', 'email'],
    phone: ['phone'],
    firstName: ['required', 'name'],
    lastName: ['required', 'name'],
    address: ['required'],
    city: ['required'],
    postcode: ['required', 'postcode'],
  });
  showErrors(form, errors);
  if (!valid) return;

  const t = withDelivery(cartTotals());
  const orderNo = `SYN-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  saveCart([]);
  setPromo('');
  root.innerHTML = `
    <div class="confirmation">
      <p class="eyebrow">Order confirmed (demo)</p>
      <h1>Thank you, ${escapeHtml(values.firstName.trim())}.</h1>
      <p class="muted">Your demo order <strong>${orderNo}</strong> totalling <strong>${formatPrice(t.total)}</strong> would be sent to
      ${escapeHtml(values.address.trim())}, ${escapeHtml(formatPostcode(values.postcode))}.</p>
      <p class="muted">This is a portfolio project, so nothing has been charged or shipped.</p>
      <a class="btn" href="shop.html" style="margin-top:16px">Continue shopping</a>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

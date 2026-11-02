import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addItem, updateQty, removeItem, itemCount, totals, loadCart, saveCart,
  FREE_SHIPPING_FROM, SHIPPING_COST, MAX_QTY,
} from '../assets/js/cart.js';
import { PRODUCTS, getProduct } from '../assets/js/products.js';

const tee = PRODUCTS.find((p) => p.price < 40);
const coat = PRODUCTS.find((p) => p.price > FREE_SHIPPING_FROM);

test('adding the same product and size merges the lines', () => {
  let cart = addItem([], { id: tee.id, size: 'M' });
  cart = addItem(cart, { id: tee.id, size: 'M', qty: 2 });
  assert.equal(cart.length, 1);
  assert.equal(cart[0].qty, 3);
});

test('different sizes are separate lines', () => {
  let cart = addItem([], { id: tee.id, size: 'S' });
  cart = addItem(cart, { id: tee.id, size: 'L' });
  assert.equal(cart.length, 2);
  assert.equal(itemCount(cart), 2);
});

test('quantity is capped and zero removes the line', () => {
  let cart = addItem([], { id: tee.id, size: 'M', qty: 50 });
  assert.equal(cart[0].qty, MAX_QTY);
  cart = updateQty(cart, { id: tee.id, size: 'M' }, 0);
  assert.equal(cart.length, 0);
});

test('size is required', () => {
  assert.throws(() => addItem([], { id: tee.id }));
});

test('shipping is charged under the free-shipping threshold', () => {
  const t = totals([{ id: tee.id, size: 'M', qty: 1 }], getProduct);
  assert.equal(t.shipping, SHIPPING_COST);
  assert.equal(t.total, Math.round((tee.price + SHIPPING_COST) * 100) / 100);
  assert.ok(t.toFreeShipping > 0);
});

test('free shipping over the threshold', () => {
  const t = totals([{ id: coat.id, size: 'M', qty: 1 }], getProduct);
  assert.equal(t.shipping, 0);
  assert.equal(t.total, coat.price);
});

test('promo code WELCOME10 takes 10% off (any case)', () => {
  const t = totals([{ id: coat.id, size: 'M', qty: 1 }], getProduct, ' welcome10 ');
  assert.equal(t.promoApplied, true);
  assert.equal(t.discount, Math.round(coat.price * 10) / 100);
});

test('unknown products and invalid codes are ignored', () => {
  const t = totals([{ id: 'nope', size: 'M', qty: 1 }], getProduct, 'FAKE');
  assert.equal(t.subtotal, 0);
  assert.equal(t.shipping, 0);
  assert.equal(t.promoApplied, false);
});

test('remove deletes only the matching line', () => {
  const cart = [{ id: 'a', size: 'S', qty: 1 }, { id: 'a', size: 'M', qty: 1 }];
  assert.deepEqual(removeItem(cart, { id: 'a', size: 'S' }), [{ id: 'a', size: 'M', qty: 1 }]);
});

test('storage round-trip and corrupt data', () => {
  const store = { data: {}, getItem(k) { return this.data[k] ?? null; }, setItem(k, v) { this.data[k] = v; } };
  saveCart([{ id: tee.id, size: 'M', qty: 2 }], store);
  assert.deepEqual(loadCart(store), [{ id: tee.id, size: 'M', qty: 2 }]);
  store.data['synth-cart-v1'] = '{broken';
  assert.deepEqual(loadCart(store), []);
  assert.deepEqual(loadCart({ getItem() { throw new Error('blocked'); } }), []);
});

test('every product has the fields the pages need', () => {
  const ids = new Set();
  for (const p of PRODUCTS) {
    assert.ok(p.id && p.name && p.price > 0 && p.sizes.length && p.credit?.url, p.id);
    assert.ok(!ids.has(p.id), `duplicate id ${p.id}`);
    ids.add(p.id);
  }
});

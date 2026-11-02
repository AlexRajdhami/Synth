import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rules, validate, formatPostcode } from '../assets/js/validation.js';

test('UK postcodes', () => {
  for (const ok of ['TW15 1AA', 'tw151aa', 'SW1A 1AA', 'M1 1AE', 'B33 8TH', 'CR2 6XH', 'DN55 1PT']) {
    assert.equal(rules.postcode(ok), '', ok);
  }
  for (const bad of ['', '12345', 'TW15', 'ABC 123', 'TW15 1AAA']) {
    assert.notEqual(rules.postcode(bad), '', bad);
  }
});

test('emails', () => {
  assert.equal(rules.email('alex@example.co.uk'), '');
  assert.notEqual(rules.email('alex@'), '');
  assert.notEqual(rules.email('no at sign.com'), '');
});

test('phone is optional but must be UK format when given', () => {
  assert.equal(rules.phone(''), '');
  assert.equal(rules.phone('07700 900123'), '');
  assert.equal(rules.phone('+44 7700 900123'), '');
  assert.notEqual(rules.phone('12345'), '');
});

test('validate returns the first error per field', () => {
  const { valid, errors } = validate(
    { name: '', email: 'bad', postcode: 'TW15 1AA' },
    { name: ['required', 'name'], email: ['required', 'email'], postcode: ['required', 'postcode'] }
  );
  assert.equal(valid, false);
  assert.equal(errors.name, 'This field is required.');
  assert.match(errors.email, /valid email/);
  assert.equal(errors.postcode, undefined);
});

test('postcode formatting', () => {
  assert.equal(formatPostcode('tw151aa'), 'TW15 1AA');
  assert.equal(formatPostcode(' sw1a1aa '), 'SW1A 1AA');
});

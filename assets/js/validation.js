// Form validation rules (pure functions, unit-tested).

const UK_POSTCODE = /^([A-Z]{1,2}\d[A-Z\d]?|GIR) ?\d[A-Z]{2}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UK_PHONE = /^(\+44\s?|0)\d[\d\s]{8,11}$/;

export const rules = {
  required: (v) => (String(v ?? '').trim() ? '' : 'This field is required.'),
  name: (v) => (/^[A-Za-zÀ-ÿ' -]{2,60}$/.test(String(v).trim()) ? '' : 'Please enter a valid name.'),
  email: (v) => (EMAIL.test(String(v).trim()) ? '' : 'Please enter a valid email address.'),
  postcode: (v) => (UK_POSTCODE.test(String(v).trim()) ? '' : 'Please enter a valid UK postcode, e.g. TW15 1AA.'),
  phone: (v) => (!String(v).trim() || UK_PHONE.test(String(v).trim()) ? '' : 'Please enter a valid UK phone number.'),
  message: (v) => (String(v).trim().length >= 10 ? '' : 'Please write at least 10 characters.'),
};

/**
 * Validate an object of values against a schema like { email: ['required', 'email'] }.
 * Returns { valid, errors } where errors maps field -> first error message.
 */
export function validate(values, schema) {
  const errors = {};
  for (const [field, checks] of Object.entries(schema)) {
    for (const check of checks) {
      const msg = rules[check](values[field] ?? '');
      if (msg) {
        errors[field] = msg;
        break;
      }
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export const formatPostcode = (v) => {
  const s = String(v).replace(/\s+/g, '').toUpperCase();
  return s.length > 3 ? `${s.slice(0, -3)} ${s.slice(-3)}` : s;
};

// Show errors next to fields: each input needs id = field and a <p class="error-text" id="field-error">
export function showErrors(form, errors) {
  form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  form.querySelectorAll('.error-text[id$="-error"]').forEach((el) => (el.textContent = ''));
  let first;
  for (const [field, msg] of Object.entries(errors)) {
    const input = form.querySelector(`#${field}`);
    const err = form.querySelector(`#${field}-error`);
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', `${field}-error`);
      first = first || input;
    }
    if (err) err.textContent = msg;
  }
  if (first) first.focus();
}

import './layout.js';
import { validate, showErrors } from './validation.js';
import { escapeHtml } from './helpers.js';

const form = document.getElementById('contact-form');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  const { valid, errors } = validate(values, {
    name: ['required', 'name'],
    email: ['required', 'email'],
    message: ['required', 'message'],
  });
  showErrors(form, errors);
  if (!valid) return;
  document.querySelector('[data-contact]').innerHTML = `
    <div class="notice" role="status">
      <h2 style="font-size:1.3rem">Thanks, ${escapeHtml(values.name.trim())}!</h2>
      <p style="margin:0">We've received your message about “${escapeHtml(values.topic)}” and will reply to ${escapeHtml(values.email.trim())} soon. (Demo only – nothing was sent.)</p>
    </div>`;
});

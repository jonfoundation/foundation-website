import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { root } from './lib/resources.mjs';
import path from 'node:path';

const code = fs.readFileSync(path.join(root, 'js/analytics.js'), 'utf8');
for (const origin of ['https://foundationrenovationcoaching.com', 'http://foundationrenovationcoaching.com', 'https://www.foundationrenovationcoaching.com', 'https://preview.foundation-website.pages.dev', 'http://localhost:4173', 'http://127.0.0.1:4173']) {
  const tags = [], listeners = [];
  const window = { location: { origin, pathname: '/resources/kitchen-renovations/' } };
  const document = { createElement: () => ({}), head: { appendChild: (tag) => tags.push(tag) }, addEventListener: (name, callback) => listeners.push(callback) };
  const context = vm.createContext({ window, document });
  vm.runInContext(code, context);
  vm.runInContext(code, context);
  const production = origin === 'https://foundationrenovationcoaching.com';
  assert.equal(tags.length, production ? 1 : 0);
  assert.equal(listeners.length, production ? 1 : 0);
  if (!production) { assert.equal(window.dataLayer, undefined); continue; }
  assert.equal(window.dataLayer.filter((a) => a[0] === 'config').length, 1);
  for (const location of ['header', 'contact_cta', 'footer', 'article_body']) {
    const selectors = { header: '.site-header', contact_cta: '.cta-band', footer: '.site-footer' };
    const link = { href: 'https://calendar.app.google/AaKjGPcvFGHM815i9', closest: (selector) => selector === selectors[location] ? {} : null };
    listeners[0]({ target: { closest: () => link } });
    const event = window.dataLayer.at(-1);
    assert.equal(event[1], 'discovery_call_click');
    assert.equal(event[2].cta_location, location);
    assert.equal(event[2].page_path, window.location.pathname);
  }
  assert.equal(window.dataLayer.filter((a) => a[0] === 'event').length, 4);
  window.location.pathname = '/examples/kitchen-renovation-and-addition/';
  for (const sample of ['roadmap', 'plan-review', 'bid-review']) {
    const before = window.dataLayer.length;
    const attributes = sample === 'roadmap'
      ? { 'data-sample-roadmap': 'alex-morgan', 'data-sample-download': 'plan-review' }
      : { 'data-sample-download': sample };
    const link = { href: `/assets/downloads/foundation-sample-${sample}-alex-morgan.pdf`, getAttribute: (name) => attributes[name] ?? null };
    listeners[0]({ target: { closest: () => link } });
    assert.equal(window.dataLayer.length, before + 1, `${sample}: one custom event per click`);
    const event = window.dataLayer.at(-1);
    assert.equal(event[1], sample === 'roadmap' ? 'sample_roadmap_click' : 'sample_download_click');
    assert.equal(event[2].sample_id, 'alex-morgan');
    assert.equal(event[2].page_path, window.location.pathname);
    assert.deepEqual(Object.keys(event[2]).sort(), sample === 'roadmap'
      ? ['page_path', 'sample_id'] : ['page_path', 'sample_id', 'sample_type']);
    if (sample !== 'roadmap') assert.equal(event[2].sample_type, sample);
  }
  const before = window.dataLayer.length;
  listeners[0]({ target: { closest: () => ({ href: '/unrelated.pdf', getAttribute: () => null }) } });
  listeners[0]({ target: { closest: () => null } });
  assert.equal(window.dataLayer.length, before, 'unrelated clicks do not emit sample events');
}
console.log('GA4 production origin, duplicate initialization, discovery_call_click and three exclusive sample-download events passed without network requests.');

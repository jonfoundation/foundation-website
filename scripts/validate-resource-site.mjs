import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { root, readArticles, readJson } from './lib/resources.mjs';
import { prepareTopics } from './lib/topics.mjs';
import { prepareArticles } from './lib/generation.mjs';

const site = readJson('data/site.json');
const articles = prepareArticles(readArticles(), site);
const { topics } = prepareTopics(articles, site);
const files = ['index.html', 'services/index.html', 'resources/index.html', ...articles.filter((a) => a.status === 'published').map((a) => a.output_path), ...topics.map((t) => `resources/${t.slug}/index.html`)];
const decode = (s) => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
let references = 0;
function resolve(url) {
  const relative = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
  for (const candidate of [relative, `${relative}.html`, `${relative}${relative.endsWith('/') ? '' : '/'}index.html`]) {
    const absolute = path.resolve(root, candidate);
    if (absolute.startsWith(root + path.sep) && fs.existsSync(absolute) && fs.statSync(absolute).isFile()) return absolute;
  }
  throw new Error(`Unresolved local URL: ${url.href}`);
}
for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const publicPath = file.endsWith('index.html') ? file.slice(0, -10) : file.replace(/\.html$/, '');
  const canonical = `${site.baseUrl}/${publicPath}`;
  assert(html.includes(`<link rel="canonical" href="${canonical}">`), `${file}: canonical mismatch`);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${file}: exactly one H1 required`);
  assert.equal((html.match(/src="\/js\/analytics.js"/g) || []).length, 1, `${file}: analytics coverage`);
  assert(!/noindex/i.test(html), `${file}: unexpected noindex`);
  for (const match of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = new URL(decode(match[1]), canonical);
    if (url.origin !== site.baseUrl) continue;
    const target = resolve(url);
    references++;
    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      const targetHtml = fs.readFileSync(target, 'utf8');
      assert(targetHtml.includes(`id="${id}"`) || targetHtml.includes(`id='${id}'`), `${file}: missing fragment ${url.href}`);
    }
  }
}
for (const article of articles.filter((a) => a.status === 'published')) {
  const html = fs.readFileSync(path.join(root, article.output_path), 'utf8');
  for (const [name, value] of [['title', article.seo_title], ['description', article.meta_description], ['og:title', article.og_title], ['og:description', article.og_description]]) {
    assert(decode(html).includes(value), `${article.kb_id}: missing ${name}`);
  }
}
console.log(`Validated ${files.length} public pages, metadata, canonicals, JSON-LD, analytics coverage and ${references} local links/fragments/assets.`);

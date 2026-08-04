import fs from 'node:fs';
import path from 'node:path';
import { readArticles, root } from './lib/resources.mjs';

const required = [
  'schema_version', 'kb_id', 'title', 'slug', 'output_path', 'canonical_url',
  'seo_title', 'meta_description', 'og_title', 'og_description', 'category',
  'summary', 'eyebrow', 'deck', 'byline', 'hero', 'status', 'toc', 'cta', 'source'
];
const allowedStatuses = new Set(['draft', 'published']);
const seen = { ids: new Set(), outputs: new Set(), canonicals: new Set() };
const errors = [];
const articles = readArticles();

for (const article of articles) {
  const label = article.kb_id || path.basename(article.sourcePath);
  for (const field of required) {
    if (article[field] === undefined || article[field] === null || article[field] === '') {
      errors.push(`${label}: missing ${field}`);
    }
  }
  if (!/^KB-\d{4}$/.test(article.kb_id || '')) errors.push(`${label}: invalid kb_id`);
  if (!allowedStatuses.has(article.status)) errors.push(`${label}: invalid status ${article.status}`);
  if (!article.output_path?.startsWith('resources/') || !article.output_path?.endsWith('.html')) {
    errors.push(`${label}: output_path must be a resources/*.html path`);
  }
  const expectedCanonical = `https://foundationsd.co/${article.output_path}`;
  if (article.canonical_url !== expectedCanonical) errors.push(`${label}: canonical does not match output_path`);
  const imagePath = article.hero?.src?.replace(/^\//, '');
  if (!imagePath || !fs.existsSync(path.join(root, imagePath))) errors.push(`${label}: hero image not found`);
  if (article.source?.master_id !== article.kb_id) errors.push(`${label}: source.master_id must match kb_id`);
  for (const [kind, value] of [['ids', article.kb_id], ['outputs', article.output_path], ['canonicals', article.canonical_url]]) {
    if (seen[kind].has(value)) errors.push(`${label}: duplicate ${kind.slice(0, -1)} ${value}`);
    seen[kind].add(value);
  }
  const ids = new Set();
  for (const item of article.toc || []) {
    if (!item.id || !item.label) errors.push(`${label}: invalid table-of-contents item`);
    if (ids.has(item.id)) errors.push(`${label}: duplicate table-of-contents id ${item.id}`);
    ids.add(item.id);
    if (!article.body.includes(`id="${item.id}"`)) errors.push(`${label}: missing body anchor ${item.id}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Validated ${articles.length} resource source file(s): ${articles.map((a) => `${a.kb_id} (${a.status})`).join(', ')}`);

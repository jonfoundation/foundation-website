import fs from 'node:fs';
import path from 'node:path';
import { readArticles, root } from './lib/resources.mjs';

const required = [
  'schema_version', 'kb_id', 'title', 'slug', 'output_path', 'canonical_url',
  'seo_title', 'meta_description', 'og_title', 'og_description', 'category',
  'summary', 'eyebrow', 'deck', 'byline', 'hero', 'status', 'toc', 'cta', 'source'
];
const allowedStatuses = new Set(['draft', 'published']);
const seen = {
  ids: new Set(), outputs: new Set(), canonicals: new Set(),
  heroImages: new Set(), socialImages: new Set(), allImages: new Set()
};
const errors = [];
const articles = readArticles();

function readImageMetadata(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    const type = buffer.subarray(12, 16).toString('ascii');
    if (type === 'VP8X') {
      return { format: 'webp', width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
    }
    if (type === 'VP8 ') {
      return { format: 'webp', width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (type === 'VP8L') {
      const bits = buffer.readUInt32LE(21);
      return { format: 'webp', width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
    }
    throw new Error('unsupported WebP encoding');
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { format: 'jpeg', width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
      }
      if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
    throw new Error('JPEG dimensions not found');
  }
  throw new Error('unsupported image format');
}

function validateImage(article, field, options) {
  const label = article.kb_id || path.basename(article.sourcePath);
  const image = article[field];
  if (!image?.src || !image?.alt) {
    errors.push(`${label}: ${field} requires src and alt`);
    return;
  }
  if (!image.alt.startsWith('Architectural illustration') && !image.alt.startsWith('Cutaway architectural illustration')) {
    errors.push(`${label}: ${field}.alt must identify the image as an architectural illustration`);
  }
  if (!image.src.startsWith('/assets/resources/')) errors.push(`${label}: ${field}.src must be root-relative under /assets/resources/`);
  const relativePath = image.src.replace(/^\//, '');
  const absolutePath = path.join(root, relativePath);
  if (path.extname(relativePath).toLowerCase() !== options.extension) {
    errors.push(`${label}: ${field}.src must use the ${options.extension} extension`);
  }
  if (!fs.existsSync(absolutePath)) {
    errors.push(`${label}: ${field} image not found: ${image.src}`);
    return;
  }
  if (fs.statSync(absolutePath).size > options.maxBytes) {
    errors.push(`${label}: ${field} exceeds ${options.maxBytes} bytes`);
  }
  try {
    const metadata = readImageMetadata(absolutePath);
    if (metadata.format !== options.format) errors.push(`${label}: ${field} must be ${options.format}`);
    if (metadata.width !== options.width || metadata.height !== options.height) {
      errors.push(`${label}: ${field} must be ${options.width}x${options.height}; found ${metadata.width}x${metadata.height}`);
    }
  } catch (error) {
    errors.push(`${label}: cannot inspect ${field}: ${error.message}`);
  }
  if (seen[options.seen].has(image.src)) errors.push(`${label}: duplicate ${field} assignment ${image.src}`);
  seen[options.seen].add(image.src);
  if (seen.allImages.has(image.src)) errors.push(`${label}: image assigned to more than one image role ${image.src}`);
  seen.allImages.add(image.src);
}

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
  validateImage(article, 'hero', {
    format: 'webp', extension: '.webp', width: 1536, height: 1024,
    maxBytes: 500_000, seen: 'heroImages'
  });
  if (article.status === 'published' && !article.social_image) errors.push(`${label}: published article requires social_image`);
  if (article.social_image) {
    validateImage(article, 'social_image', {
      format: 'jpeg', extension: '.jpg', width: 1200, height: 630,
      maxBytes: 300_000, seen: 'socialImages'
    });
  }
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

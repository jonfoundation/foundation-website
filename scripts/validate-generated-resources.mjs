import fs from 'node:fs';
import path from 'node:path';
import { prepareArticles, parseSitemap, renderSitemap } from './lib/generation.mjs';
import { readArticles, readJson, root } from './lib/resources.mjs';

const errors = [];
const site = readJson('data/site.json');
const hubData = readJson('data/resources.json');
const articles = prepareArticles(readArticles(), site);
const previewRoot = path.join(root, '.preview');
const hubPath = path.join(previewRoot, 'resources', 'index.html');

function sameJson(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function schemaFrom(html, name, label) {
  const match = html.match(new RegExp(`<script type="application/ld\\+json" data-schema="${name}">([\\s\\S]*?)<\\/script>`));
  if (!match) { errors.push(`${label}: missing ${name} structured data`); return null; }
  try { return JSON.parse(match[1]); } catch (error) {
    errors.push(`${label}: invalid ${name} structured data: ${error.message}`);
    return null;
  }
}

if (!fs.existsSync(hubPath)) {
  errors.push('Draft Resources hub is missing');
} else {
  const html = fs.readFileSync(hubPath, 'utf8');
  const cardIds = [...html.matchAll(/data-kb-id="(KB-\d{4})"/g)].map((match) => match[1]);
  const expectedIds = articles.map((article) => article.kb_id);
  if (cardIds.join(',') !== expectedIds.join(',')) errors.push(`Hub card order mismatch: ${cardIds.join(',')}`);
  if (cardIds[0] !== hubData.featuredKbId) errors.push('Hub featured article does not match configured KB ID');
  for (const article of articles) {
    for (const token of [
      `data-kb-id="${article.kb_id}"`, `href="${article.url}"`,
      `src="..${article.hero.src}"`, `alt="${article.hero.alt}"`,
      article.title, article.summary, article.category
    ]) {
      if (!html.includes(token)) errors.push(`Hub: ${article.kb_id} missing ${token}`);
    }
  }
}

for (const article of articles) {
  const filePath = path.join(previewRoot, article.output_path);
  if (!fs.existsSync(filePath)) { errors.push(`${article.kb_id}: preview file missing`); continue; }
  const html = fs.readFileSync(filePath, 'utf8');
  const articleSchema = schemaFrom(html, 'article', article.kb_id);
  const breadcrumbSchema = schemaFrom(html, 'breadcrumb', article.kb_id);
  if (articleSchema && !sameJson(articleSchema, article.article_schema)) errors.push(`${article.kb_id}: Article schema disagrees with metadata`);
  if (breadcrumbSchema && !sameJson(breadcrumbSchema, article.breadcrumb_schema)) errors.push(`${article.kb_id}: Breadcrumb schema disagrees with metadata`);
  const relatedIds = [...html.matchAll(/data-related-kb-id="(KB-\d{4})"/g)].map((match) => match[1]);
  if (relatedIds.join(',') !== article.related_ids.join(',')) errors.push(`${article.kb_id}: related article order or resolution mismatch`);
  for (const related of article.related_articles) {
    for (const token of [`href="${related.url}"`, `src="..${related.hero.src}"`, `alt="${related.hero.alt}"`]) {
      if (!html.includes(token)) errors.push(`${article.kb_id}: related ${related.kb_id} missing ${token}`);
    }
  }
  const visiblePublication = html.match(/<time datetime="([^"]+)">Published ([^<]+)<\/time>/);
  const visibleUpdated = html.match(/<time datetime="([^"]+)">Updated ([^<]+)<\/time>/);
  if (article.publication_date) {
    if (!visiblePublication || visiblePublication[1] !== article.publication_date || visiblePublication[2] !== article.publication_label) errors.push(`${article.kb_id}: visible publication date mismatch`);
  } else if (visiblePublication) errors.push(`${article.kb_id}: unassigned publication date rendered`);
  if (article.updated_date) {
    if (!visibleUpdated || visibleUpdated[1] !== article.updated_date || visibleUpdated[2] !== article.updated_label) errors.push(`${article.kb_id}: visible updated date mismatch`);
  } else if (visibleUpdated) errors.push(`${article.kb_id}: unassigned updated date rendered`);
}

const sitemapXml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapEntries = parseSitemap(sitemapXml);
const sitemapUrls = sitemapEntries.map((entry) => entry.loc);
if (new Set(sitemapUrls).size !== sitemapUrls.length) errors.push('Sitemap contains duplicate URLs');
if (sitemapUrls.includes(`${site.baseUrl}/services/`)) errors.push('Services must not be added to the sitemap yet');
const published = articles.filter((article) => article.status === 'published');
const candidateEntries = parseSitemap(renderSitemap(sitemapXml, articles, site));
const retainedUrls = sitemapUrls.filter((url) => !url?.startsWith(`${site.baseUrl}/resources/`) || url === `${site.baseUrl}/resources/`);
const candidateRetainedUrls = candidateEntries.map((entry) => entry.loc)
  .filter((url) => !url?.startsWith(`${site.baseUrl}/resources/`) || url === `${site.baseUrl}/resources/`);
if (!sameJson(retainedUrls, candidateRetainedUrls)) errors.push('Generated sitemap does not preserve existing non-article URLs');
const candidateResourceEntries = candidateEntries.filter((entry) => entry.loc?.startsWith(`${site.baseUrl}/resources/`) && entry.loc !== `${site.baseUrl}/resources/`);
if (!sameJson(candidateResourceEntries.map((entry) => entry.loc), published.map((article) => article.canonical_url))) {
  errors.push('Generated sitemap candidate disagrees with published article order or URLs');
}
for (const article of published) {
  const entry = candidateResourceEntries.find((candidate) => candidate.loc === article.canonical_url);
  if (entry?.lastmod !== (article.updated_date || article.publication_date)) errors.push(`${article.kb_id}: sitemap lastmod mismatch`);
}
if (published.length) {
  const expected = new Set(published.map((article) => article.canonical_url));
  const actual = new Set(sitemapUrls.filter((url) => url?.startsWith(`${site.baseUrl}/resources/`) && url !== `${site.baseUrl}/resources/`));
  if (!sameJson([...actual].sort(), [...expected].sort())) errors.push('Sitemap resource entries disagree with published article files');
  for (const article of published) {
    if (!fs.existsSync(path.join(root, article.output_path))) errors.push(`${article.kb_id}: published output is missing`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Validated generated draft hub and ${articles.length} article preview(s), related cards, structured data, visible dates, and sitemap state.`);
if (!published.length) console.log('Sitemap ownership remains inactive while all source articles are drafts; the existing production sitemap is preserved.');

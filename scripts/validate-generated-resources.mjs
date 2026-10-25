import fs from 'node:fs';
import path from 'node:path';
import { prepareArticles, parseSitemap, renderSitemap } from './lib/generation.mjs';
import { readArticles, readJson, root } from './lib/resources.mjs';
import { prepareTopics, searchIndex } from './lib/topics.mjs';

const errors = [];
const site = readJson('data/site.json');
const articles = prepareArticles(readArticles(), site);
const { topics, startHere } = prepareTopics(articles, site);
const topicUrls = topics.map((topic) => topic.canonical);
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
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';
  if ((main.match(/<img /g) || []).length > 12) errors.push('Landing page exceeds 12 content thumbnails');
  if (articles.every((article) => main.includes(`href="${article.url}"`))) errors.push('Landing page embeds the entire article catalog');
  for (const item of [...topics, ...startHere]) if (!html.includes('href="' + item.url + '"')) errors.push('Landing page missing ' + item.url);
  if ((html.match(/<li>/g) || []).length !== 6) errors.push('Landing page must contain six recent guides');
}

for (const article of articles) {
  const filePath = path.join(previewRoot, article.output_path);
  if (!fs.existsSync(filePath)) { errors.push(`${article.kb_id}: preview file missing`); continue; }
  const html = fs.readFileSync(filePath, 'utf8');
  const articleSchema = schemaFrom(html, 'article', article.kb_id);
  const breadcrumbSchema = schemaFrom(html, 'breadcrumb', article.kb_id);
  if (articleSchema && !sameJson(articleSchema, article.article_schema)) errors.push(`${article.kb_id}: Article schema disagrees with metadata`);
  if (breadcrumbSchema && !sameJson(breadcrumbSchema, article.breadcrumb_schema)) errors.push(`${article.kb_id}: Breadcrumb schema disagrees with metadata`);
  const relatedUrls = [...html.matchAll(/<article class="related-resource-card"><a href="([^"]+)"/g)].map((match) => match[1]);
  const expectedRelatedUrls = article.related_articles.map((related) => related.url);
  if (relatedUrls.join(',') !== expectedRelatedUrls.join(',')) errors.push(`${article.kb_id}: related article order or resolution mismatch`);
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
const published = articles.filter((article) => article.status === 'published');
const hasServicesEntry = sitemapUrls.includes(`${site.baseUrl}/services/`);
if (published.length && !hasServicesEntry) errors.push('Published sitemap is missing the Services URL');
if (!published.length && hasServicesEntry) errors.push('Draft-only sitemap must not include the unpublished Services URL');
const candidateEntries = parseSitemap(renderSitemap(sitemapXml, articles, site));
const retainedUrls = sitemapUrls.filter((url) => !url?.startsWith(`${site.baseUrl}/resources/`) || url === `${site.baseUrl}/resources/`);
const candidateRetainedUrls = candidateEntries.map((entry) => entry.loc)
  .filter((url) => !url?.startsWith(`${site.baseUrl}/resources/`) || url === `${site.baseUrl}/resources/`);
if (!sameJson(retainedUrls, candidateRetainedUrls)) errors.push('Generated sitemap does not preserve existing non-article URLs');
const candidateResourceEntries = candidateEntries.filter((entry) => entry.loc?.startsWith(`${site.baseUrl}/resources/`) && entry.loc !== `${site.baseUrl}/resources/` && !topicUrls.includes(entry.loc));
if (!sameJson(candidateResourceEntries.map((entry) => entry.loc), published.map((article) => article.canonical_url))) {
  errors.push('Generated sitemap candidate disagrees with published article order or URLs');
}
for (const article of published) {
  const entry = candidateResourceEntries.find((candidate) => candidate.loc === article.canonical_url);
  if (entry?.lastmod !== (article.updated_date || article.publication_date)) errors.push(`${article.kb_id}: sitemap lastmod mismatch`);
}
if (published.length) {
  const expected = new Set([...published.map((article) => article.canonical_url), ...topicUrls]);
  const actual = new Set(sitemapUrls.filter((url) => url?.startsWith(`${site.baseUrl}/resources/`) && url !== `${site.baseUrl}/resources/`));
  if (!sameJson([...actual].sort(), [...expected].sort())) errors.push('Sitemap resource entries disagree with published article files');
  for (const article of published) {
    if (!fs.existsSync(path.join(root, article.output_path))) errors.push(`${article.kb_id}: published output is missing`);
  }
}

for (const base of [root, previewRoot]) {
  const index = JSON.parse(fs.readFileSync(path.join(base, 'resources/resource-index.json'), 'utf8'));
  if (!sameJson(index, searchIndex(topics))) errors.push('Search index disagrees with published article set: ' + base);
  for (const topic of topics) {
    const html = fs.readFileSync(path.join(base, 'resources', topic.slug, 'index.html'), 'utf8');
    if (!html.includes('<link rel="canonical" href="' + topic.canonical + '">')) errors.push('Topic canonical mismatch: ' + topic.slug);
    if (!html.includes('<title>' + topic.seoTitle.replaceAll('&', '&amp;') + '</title>')) errors.push('Topic title mismatch: ' + topic.slug);
    const collection = schemaFrom(html, 'collection', topic.slug);
    const breadcrumb = schemaFrom(html, 'breadcrumb', topic.slug);
    if (!sameJson(collection, JSON.parse(topic.collectionJson))) errors.push('Topic collection schema mismatch: ' + topic.slug);
    if (!sameJson(breadcrumb, JSON.parse(topic.breadcrumbJson))) errors.push('Topic breadcrumb schema mismatch: ' + topic.slug);
    const list = html.match(/<ul class="hub-article-list">([\s\S]*?)<\/ul>/)?.[1] || '';
    const urls = [...list.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    if (!sameJson(urls, topic.articles.map((article) => article.url))) errors.push('Topic article list mismatch: ' + topic.slug);
    if ((html.match(/<img /g) || []).length !== 3) errors.push('Topic must have one content image: ' + topic.slug);
    if (!sitemapUrls.includes(topic.canonical)) errors.push('Missing topic sitemap URL: ' + topic.slug);
  }
}
if (!sameJson(parseSitemap(renderSitemap(sitemapXml, articles, site)), sitemapEntries)) errors.push('Sitemap is not reproducible');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Validated generated landing page, topic hubs and ${articles.length} article preview(s), related cards, structured data, visible dates, and sitemap state.`);
if (!published.length) console.log('Sitemap ownership remains inactive while all source articles are drafts; the existing production sitemap is preserved.');

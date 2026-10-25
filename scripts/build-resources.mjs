import fs from 'node:fs';
import path from 'node:path';
import nunjucks from 'nunjucks';
import { assertInside, readArticles, readJson, root } from './lib/resources.mjs';
import { outputPath, prepareArticles, renderSitemap } from './lib/generation.mjs';
import { prepareTopics, searchIndex } from './lib/topics.mjs';

const args = process.argv.slice(2);
const includeDrafts = args.includes('--drafts');
const outputIndex = args.indexOf('--output');
const outputRoot = outputIndex >= 0 ? path.resolve(root, args[outputIndex + 1]) : root;

if (includeDrafts && outputRoot === root) {
  throw new Error('Draft builds must use a separate --output directory.');
}

const environment = nunjucks.configure(path.join(root, 'templates'), {
  autoescape: false,
  noCache: true,
  throwOnUndefined: true
});
const site = readJson('data/site.json');
const hub = readJson('data/resources.json');
const articles = prepareArticles(readArticles(), site);
const { topics, startHere } = prepareTopics(articles, site);
const selected = articles.filter((article) => article.status === 'published' || includeDrafts);
const selectedIds = new Set(selected.map((article) => article.kb_id));

function writeHtml(destination, html) {
  const content = `${html.trim()}\n`;
  // Preserve unchanged checkout bytes, including Git's Windows line endings.
  if (fs.existsSync(destination) && fs.readFileSync(destination, 'utf8').replaceAll('\r\n', '\n') === content.replaceAll('\r\n', '\n')) return;
  fs.writeFileSync(destination, content, 'utf8');
}

for (const sourceArticle of selected) {
  const article = {
    ...sourceArticle,
    related_articles: sourceArticle.related_articles.filter((related) => selectedIds.has(related.kb_id))
  };
  const destination = outputPath(outputRoot, article.output_path);
  assertInside(outputRoot, destination);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const html = environment.render('resources/article.html', { article, body: article.body, site });
  writeHtml(destination, html);
  console.log(`${article.status}: ${path.relative(root, destination)}`);
}

if (includeDrafts || selected.length > 0) {
  const featured = selected.find((article) => article.kb_id === hub.featuredKbId) || selected[0];
  const recent = articles.filter((article) => article.status === 'published')
    .sort((a, b) => b.publication_date.localeCompare(a.publication_date) || b.hub_order - a.hub_order).slice(0, 6);
  const destination = outputPath(outputRoot, 'resources/index.html');
  assertInside(outputRoot, destination);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const html = environment.render('resources/index.html', { recent, startHere, topics, featured, hub, site });
  writeHtml(destination, html);
  console.log(`hub: ${path.relative(root, destination)} (${selected.length} article(s))`);
}

for (const topic of topics) {
  const destination = outputPath(outputRoot, `resources/${topic.slug}/index.html`);
  assertInside(outputRoot, destination);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const html = environment.render('resources/topic.html', { topic, site });
  writeHtml(destination, html);
}
fs.writeFileSync(outputPath(outputRoot, 'resources/resource-index.json'), `${JSON.stringify(searchIndex(topics))}\n`, 'utf8');

if (!includeDrafts && selected.length > 0) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  const sitemap = renderSitemap(fs.readFileSync(sitemapPath, 'utf8'), articles, site);
  const destination = outputPath(outputRoot, 'sitemap.xml');
  assertInside(outputRoot, destination);
  fs.writeFileSync(destination, sitemap, 'utf8');
  console.log(`sitemap: ${path.relative(root, destination)} (${selected.length} published resource article(s))`);
}

if (!includeDrafts) {
  console.log(`Production build selected ${selected.length} published article(s); drafts were excluded.`);
}

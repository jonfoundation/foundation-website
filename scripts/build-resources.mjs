import fs from 'node:fs';
import path from 'node:path';
import nunjucks from 'nunjucks';
import { assertInside, readArticles, readJson, root } from './lib/resources.mjs';
import { outputPath, prepareArticles, renderSitemap } from './lib/generation.mjs';

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
const selected = articles.filter((article) => article.status === 'published' || includeDrafts);
const selectedIds = new Set(selected.map((article) => article.kb_id));

for (const sourceArticle of selected) {
  const article = {
    ...sourceArticle,
    related_articles: sourceArticle.related_articles.filter((related) => selectedIds.has(related.kb_id))
  };
  const destination = outputPath(outputRoot, article.output_path);
  assertInside(outputRoot, destination);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const html = environment.render('resources/article.html', { article, body: article.body, site });
  fs.writeFileSync(destination, `${html.trim()}\n`, 'utf8');
  console.log(`${article.status}: ${path.relative(root, destination)}`);
}

if (includeDrafts || selected.length > 0) {
  const featured = selected.find((article) => article.kb_id === hub.featuredKbId) || selected[0];
  const remaining = selected.filter((article) => article.kb_id !== featured.kb_id);
  const destination = outputPath(outputRoot, 'resources/index.html');
  assertInside(outputRoot, destination);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const html = environment.render('resources/index.html', { articles: remaining, featured, hub, site });
  fs.writeFileSync(destination, `${html.trim()}\n`, 'utf8');
  console.log(`hub: ${path.relative(root, destination)} (${selected.length} article(s))`);
}

if (!includeDrafts && selected.length > 0) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  const sitemap = renderSitemap(fs.readFileSync(sitemapPath, 'utf8'), articles, site);
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  console.log(`sitemap: ${path.relative(root, sitemapPath)} (${selected.length} published resource article(s))`);
}

if (!includeDrafts) {
  console.log(`Production build selected ${selected.length} published article(s); drafts were excluded.`);
}

import fs from 'node:fs';
import path from 'node:path';
import nunjucks from 'nunjucks';
import { assertInside, readArticles, readJson, root } from './lib/resources.mjs';

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
const articles = readArticles();
const selected = articles.filter((article) => article.status === 'published' || includeDrafts);

for (const article of selected) {
  const destination = path.resolve(outputRoot, article.output_path);
  assertInside(outputRoot, destination);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const html = environment.render('resources/article.html', { article, body: article.body, site });
  fs.writeFileSync(destination, `${html.trim()}\n`, 'utf8');
  console.log(`${article.status}: ${path.relative(root, destination)}`);
}

if (!includeDrafts) {
  console.log(`Production build selected ${selected.length} published article(s); drafts were excluded.`);
}

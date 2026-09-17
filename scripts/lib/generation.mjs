import path from 'node:path';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value) {
  if (!datePattern.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${value}T00:00:00Z`));
}

export function jsonForHtml(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

export function prepareArticles(articles, site) {
  const ordered = [...articles].sort((a, b) => a.hub_order - b.hub_order);
  const byId = new Map(ordered.map((article) => [article.kb_id, article]));

  return ordered.map((source) => {
    const article = { ...source, url: new URL(source.canonical_url).pathname };
    article.related_articles = (source.related_ids || []).map((id) => {
      const related = byId.get(id);
      if (!related) return null;
      return {
        kb_id: related.kb_id,
        title: related.title,
        summary: related.summary,
        category: related.category,
        hero: related.hero,
        url: new URL(related.canonical_url).pathname
      };
    }).filter(Boolean);
    article.publication_label = source.publication_date ? formatDate(source.publication_date) : null;
    article.updated_label = source.updated_date ? formatDate(source.updated_date) : null;
    article.article_schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      identifier: source.kb_id,
      headline: source.title,
      description: source.meta_description,
      mainEntityOfPage: { '@type': 'WebPage', '@id': source.canonical_url },
      author: { '@type': 'Person', name: site.authorName },
      publisher: {
        '@type': 'Organization',
        name: site.siteName,
        url: site.baseUrl,
        logo: { '@type': 'ImageObject', url: `${site.baseUrl}/assets/foundation-header-logo.png` }
      },
      image: `${site.baseUrl}${source.social_image.src}`
    };
    if (source.publication_date) article.article_schema.datePublished = source.publication_date;
    if (source.updated_date) article.article_schema.dateModified = source.updated_date;
    article.breadcrumb_schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Resources', item: `${site.baseUrl}/resources/` },
        { '@type': 'ListItem', position: 3, name: source.title, item: source.canonical_url }
      ]
    };
    article.article_schema_json = jsonForHtml(article.article_schema);
    article.breadcrumb_schema_json = jsonForHtml(article.breadcrumb_schema);
    return article;
  });
}

export function parseSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => {
    const block = match[0];
    const value = (tag) => block.match(new RegExp(`<${tag}>([^<]+)</${tag}>`))?.[1] || null;
    return { block, loc: value('loc'), lastmod: value('lastmod') };
  });
}

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function renderSitemap(existingXml, articles, site) {
  const published = articles.filter((article) => article.status === 'published')
    .sort((a, b) => a.hub_order - b.hub_order);
  const canonicalOrigin = new URL(site.baseUrl).origin;
  const retained = parseSitemap(existingXml)
    .map((entry) => {
      if (!entry.loc) return entry;
      const url = new URL(entry.loc);
      if (url.hash) throw new Error(`Sitemap URL must not contain a fragment: ${entry.loc}`);
      if (url.origin !== canonicalOrigin) {
        throw new Error(`Sitemap URL must use the canonical origin ${canonicalOrigin}: ${entry.loc}`);
      }
      return entry;
    })
    .filter((entry) => !entry.loc?.startsWith(`${site.baseUrl}/resources/`) || entry.loc === `${site.baseUrl}/resources/`)
    .map((entry) => `  ${entry.block.replaceAll('\n', '').trim()}`);
  const resourceEntries = published.map((article) => {
    const lastmod = article.updated_date || article.publication_date;
    return `  <url><loc>${escapeXml(article.canonical_url)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>monthly</changefreq><priority>0.9</priority></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...retained, ...resourceEntries].join('\n')}\n</urlset>\n`;
}

export function outputPath(outputRoot, relativePath) {
  return path.resolve(outputRoot, relativePath);
}

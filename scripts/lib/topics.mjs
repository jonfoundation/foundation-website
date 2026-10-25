import { readJson } from './resources.mjs';
import { jsonForHtml } from './generation.mjs';

// Explicit IDs make publication an intentional classification decision.
export function prepareTopics(articles, site, config = readJson('data/resource-topics.json')) {
  const published = articles.filter((article) => article.status === 'published');
  const byId = new Map(published.map((article) => [article.kb_id, article]));
  const assigned = new Set();
  const slugs = new Set();
  if (config.topics.length !== 8) throw new Error('Exactly eight resource topics are required');
  const topics = config.topics.map((topic) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.slug) || slugs.has(topic.slug)) throw new Error(`Invalid or duplicate topic: ${topic.slug}`);
    slugs.add(topic.slug);
    if (!topic.title || !topic.description || !['project', 'decision'].includes(topic.group)) throw new Error(`Invalid topic metadata: ${topic.slug}`);
    const members = topic.articleIds.map((id) => {
      if (!byId.has(id)) throw new Error(`Topic ${topic.slug}: unpublished or unknown article ${id}`);
      if (assigned.has(id)) throw new Error(`Duplicate topic assignment: ${id}`);
      assigned.add(id);
      return byId.get(id);
    }).sort((a, b) => a.hub_order - b.hub_order);
    if (!topic.articleIds.includes(topic.pillarId)) throw new Error(`Topic ${topic.slug}: pillar must be an assigned published article`);
    const url = `/resources/${topic.slug}/`;
    const canonical = `${site.baseUrl}${url}`;
    const items = members.map((article, index) => ({ '@type': 'ListItem', position: index + 1, name: article.title, url: article.canonical_url }));
    return {
      ...topic, url, canonical, articles: members, pillar: byId.get(topic.pillarId),
      seoTitle: `${topic.title} Guides | Foundation`,
      collectionJson: jsonForHtml({ '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': canonical, url: canonical, name: topic.title, description: topic.description, mainEntity: { '@type': 'ItemList', numberOfItems: members.length, itemListElement: items } }),
      breadcrumbJson: jsonForHtml({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Resources', item: `${site.baseUrl}/resources/` },
        { '@type': 'ListItem', position: 3, name: topic.title, item: canonical }
      ] })
    };
  });
  for (const article of published) if (!assigned.has(article.kb_id)) throw new Error(`Missing primary topic: ${article.kb_id}`);
  const startHere = config.startHereIds.map((id) => {
    if (!byId.has(id)) throw new Error(`Unpublished Start Here guide: ${id}`);
    return byId.get(id);
  });
  return { topics, startHere };
}

export function searchIndex(topics) {
  return topics.flatMap((topic) => topic.articles.map((article) => ({
    title: article.title, summary: article.summary, url: article.url, topic: topic.title, kb_id: article.kb_id
  })));
}

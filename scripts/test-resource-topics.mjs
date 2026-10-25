import assert from 'node:assert/strict';
import { readArticles, readJson } from './lib/resources.mjs';
import { prepareArticles } from './lib/generation.mjs';
import { prepareTopics, searchIndex } from './lib/topics.mjs';

const site = readJson('data/site.json');
const articles = prepareArticles(readArticles(), site);
const config = readJson('data/resource-topics.json');
const firstId = config.topics[0].articleIds[0];
function rejects(change, pattern, sources = articles) {
  const candidate = structuredClone(config);
  change(candidate);
  assert.throws(() => prepareTopics(sources, site, candidate), pattern);
}
rejects((c) => c.topics[0].articleIds.splice(1, 1), /Missing primary topic/);
rejects((c) => c.topics[1].articleIds.push(firstId), /Duplicate topic assignment/);
rejects((c) => c.topics[0].articleIds.push('KB-9999'), /unpublished or unknown/);
rejects(() => {}, /unpublished or unknown/, articles.map((a) => a.kb_id === firstId ? { ...a, status: 'draft' } : a));
rejects((c) => { c.topics[0].slug = '../escape'; }, /Invalid or duplicate topic/);
assert.throws(() => prepareTopics([...articles, { ...articles[0], kb_id: 'KB-9999' }], site, config), /Missing primary topic/);
const sources = [...articles, { ...articles[0], kb_id: 'KB-9999', status: 'draft' }];
const { topics } = prepareTopics(sources, site, config);
assert.equal(searchIndex(topics).length, articles.filter((a) => a.status === 'published').length);
assert(!searchIndex(topics).some((a) => a.kb_id === 'KB-9999'));
console.log('Topic assignment failure cases, future-publication requirement and published-only search passed.');

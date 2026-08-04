import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

export const root = path.resolve(import.meta.dirname, '../..');
const markdown = new MarkdownIt({ html: true, typographer: false });

export function readArticles() {
  const directory = path.join(root, 'content', 'resources');
  return fs.readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => {
      const sourcePath = path.join(directory, name);
      const parsed = matter(fs.readFileSync(sourcePath, 'utf8'));
      return { ...parsed.data, body: markdown.render(parsed.content).trim(), sourcePath };
    });
}

export function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

export function assertInside(base, target) {
  const relative = path.relative(base, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Output path escapes destination: ${target}`);
  }
}

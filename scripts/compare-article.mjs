import fs from 'node:fs';

const [currentPath, generatedPath] = process.argv.slice(2);
if (!currentPath || !generatedPath) throw new Error('Provide current and generated HTML paths.');

const current = fs.readFileSync(currentPath, 'utf8').replace(/\r\n/g, '\n').trim();
const generated = fs.readFileSync(generatedPath, 'utf8').replace(/\r\n/g, '\n').trim();
const normalize = (html) => html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();

if (normalize(current) !== normalize(generated)) {
  console.error('Generated article differs structurally or textually from the current article.');
  process.exit(1);
}
console.log('Generated article is structurally and textually equivalent after whitespace normalization.');

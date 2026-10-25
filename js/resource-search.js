(() => {
  'use strict';
  const form = document.querySelector('.resource-search');
  if (!form) return;
  const input = form.querySelector('input');
  const results = document.getElementById('resource-results');
  const status = document.getElementById('search-status');
  let index;
  let version = 0;
  function loadIndex() {
    if (!index) index = fetch('/resources/resource-index.json')
      .then((response) => {
        if (!response.ok) throw new Error('Search unavailable');
        return response.json();
      }).catch((error) => { index = null; throw error; });
    return index;
  }
  async function search() {
    const current = ++version;
    const query = input.value.trim().toLocaleLowerCase();
    results.replaceChildren();
    results.hidden = true;
    if (!query) { status.textContent = 'Enter a topic or browse the guides below.'; return; }
    status.textContent = 'Searching…';
    try {
      const articles = await loadIndex();
      if (current !== version) return;
      const matches = articles.filter((article) => `${article.title} ${article.summary}`.toLocaleLowerCase().includes(query));
      for (const article of matches) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = article.url;
        link.textContent = article.title;
        const summary = document.createElement('p');
        summary.textContent = article.summary;
        const topic = document.createElement('small');
        topic.textContent = article.topic;
        item.append(link, summary, topic);
        results.append(item);
      }
      results.hidden = !matches.length;
      status.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'guide' : 'guides'} found.` : 'No guides found. Try a broader phrase or browse the topics below.';
    } catch {
      if (current === version) status.textContent = 'Search is temporarily unavailable. Browse the topics below to find every guide.';
    }
  }
  input.addEventListener('focus', () => { loadIndex().catch(() => {}); }, { once: true });
  input.addEventListener('input', search);
  form.addEventListener('submit', (event) => { event.preventDefault(); search(); });
})();

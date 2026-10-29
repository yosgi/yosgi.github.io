(() => {
  const start = () => {
    if (typeof mermaid === 'undefined') return;
    const diagrams = [...document.querySelectorAll('pre code.language-mermaid')].map(code => {
      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid';
      const source = code.textContent;
      code.parentElement.replaceWith(wrapper);
      return { wrapper, source };
    });
    if (!diagrams.length) return;
    let running = false;
    let pending = false;
    async function render() {
      if (running) { pending = true; return; }
      running = true;
      try {
        do {
          pending = false;
          mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: document.documentElement.getAttribute('data-color-mode') === 'dark' ? 'dark' : 'default' });
          for (const { wrapper, source } of diagrams) {
            wrapper.textContent = source;
            wrapper.removeAttribute('data-processed');
          }
          await mermaid.run({ nodes: diagrams.map(d => d.wrapper) });
        } while (pending);
      } finally { running = false; }
    }
    render().catch(console.error);
    new MutationObserver(() => render().catch(console.error)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-color-mode'] });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();

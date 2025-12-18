document.addEventListener("DOMContentLoaded", () => {
  if (typeof mermaid === "undefined") return;

  // Move mermaid code blocks into <div class="mermaid"> for rendering.
  const codeBlocks = document.querySelectorAll("pre code.language-mermaid");
  if (!codeBlocks.length) return;

  mermaid.initialize({ startOnLoad: false, theme: "default" });

  codeBlocks.forEach((codeBlock) => {
    const parent = codeBlock.parentElement;
    if (!parent) return;

    const wrapper = document.createElement("div");
    wrapper.className = "mermaid";
    wrapper.textContent = codeBlock.textContent;
    parent.replaceWith(wrapper);
  });

  mermaid.run();
});

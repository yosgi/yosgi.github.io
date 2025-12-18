// Convert plaintext lines that start with ">" into real blockquotes.
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".markdown-body");
  if (!container) return;

  container.querySelectorAll("p").forEach((p) => {
    const match = p.textContent.match(/^\s*>\s*(.+)/);
    if (!match) return;

    const blockquote = document.createElement("blockquote");
    const inner = document.createElement("p");
    inner.textContent = match[1];
    blockquote.appendChild(inner);
    p.replaceWith(blockquote);
  });
});

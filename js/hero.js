// Hero headline typed out one character at a time, rebuilt from the
// <template> in index.html so the markup stays the source of truth.

// ========= HERO TYPING =========
function buildHeroTokens(fragment) {
  const tokens = [];
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.nodeValue.replace(/\s+/g, ' ');
      if (t.trim()) tokens.push({ type: 'text', text: t });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = node.tagName.toLowerCase();
    if (tag === 'br') { tokens.push({ type: 'br' }); return; }
    if (tag === 'span') {
      tokens.push({ type: 'span', className: node.className || '', text: node.textContent || '' });
      return;
    }
    node.childNodes.forEach(walk);
  };
  fragment.childNodes.forEach(walk);
  return tokens;
}

export async function typeHero() {
  const target = document.getElementById('typedHero');
  const tpl = document.getElementById('heroTemplate');
  if (!target || !tpl) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    target.classList.remove('typing');
    target.innerHTML = tpl.innerHTML;
    return;
  }

  const fragment = tpl.content.cloneNode(true);
  const tokens = buildHeroTokens(fragment);

  target.innerHTML = '';
  target.classList.add('typing');

  const speed = 22;
  const linePause = 160;

  for (const tok of tokens) {
    if (tok.type === 'br') {
      target.appendChild(document.createElement('br'));
      await new Promise(r => setTimeout(r, linePause));
      continue;
    }

    if (tok.type === 'span') {
      const span = document.createElement('span');
      span.className = tok.className;
      span.textContent = '';
      target.appendChild(span);

      for (const ch of tok.text) {
        span.textContent += ch;
        await new Promise(r => setTimeout(r, speed));
      }
      continue;
    }

    const textNode = document.createTextNode('');
    target.appendChild(textNode);
    for (const ch of tok.text) {
      textNode.nodeValue += ch;
      await new Promise(r => setTimeout(r, speed));
    }
  }

  target.classList.remove('typing');
}

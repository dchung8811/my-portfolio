/* ---------- Personal Work chrome wash ----------
   Publishes the reader's progress through the section as --pw-p (0 → 1).
   Reads are rAF-batched and only run while the section is on screen, so
   scrolling the rest of the page costs nothing. */

export function initChromeWash() {
  const section = document.getElementById('personal-work');
  if (!section || !section.querySelector('.pw-chrome')) return;

  let ticking = false, live = false;

  function apply() {
    ticking = false;
    const r = section.getBoundingClientRect();
    // 0 as the section's top meets the bottom of the viewport,
    // 1 once its bottom has passed the top.
    const span = r.height + window.innerHeight;
    const p = span > 0 ? (window.innerHeight - r.top) / span : 0;
    section.style.setProperty('--pw-p', Math.min(1, Math.max(0, p)).toFixed(4));
  }
  function onScroll() {
    if (!live || ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  }

  new IntersectionObserver(([e]) => {
    live = e.isIntersecting;
    if (live) apply();
  }, { threshold: 0 }).observe(section);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  apply();
}

/* ---------- "See more projects" drawer ---------- */

export function initMoreProjects() {
  const toggle = document.querySelector('[data-more-toggle]');
  const drawer = document.getElementById('more-projects');
  if (!toggle || !drawer) return;

  const label = toggle.querySelector('[data-more-label]');
  const openText = 'See more projects';
  const closeText = 'Show fewer projects';
  const big = toggle.querySelector('.big');
  const count = drawer.querySelectorAll('.tile-link').length;
  if (big) big.textContent = '+' + count;

  // JS is present: reveal the toggle and collapse the drawer it controls.
  document.documentElement.classList.add('js-more');
  drawer.classList.add('is-collapsed');
  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', () => {
    const open = !drawer.classList.toggle('is-collapsed');
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? closeText : openText;

    // On opening, pull the revealed row into view if it landed below the
    // fold. On closing, leave the scroll position where the reader put it.
    if (open) {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(() => {
        if (drawer.getBoundingClientRect().bottom > window.innerHeight) {
          drawer.scrollIntoView({ block: 'end', behavior: reduce ? 'auto' : 'smooth' });
        }
      }, 520);
    }
  });
}

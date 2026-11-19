// Everything driven by scroll position in one rAF-batched handler: the
// pinned hero, its fade, the section pill, and the controls' contrast.

export function initScrollChrome() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========= HERO PIN: Selected Work slides up over the hero =========
  const stack = document.getElementById('introStack');
  const heroSection = document.getElementById('home');
  const heroInner = heroSection?.querySelector('.hero');

  const updateHeroPin = () => {
    if (!stack || !heroSection) return;
    stack.classList.toggle('hero-sticky', !reduceMotion);
    // If the hero is taller than the screen (phones), pin it once its bottom reaches the bottom of the screen
    heroSection.style.top = `${Math.min(0, window.innerHeight - heroSection.offsetHeight)}px`;
  };

  const updateHeroFade = () => {
    if (!heroInner) return;
    if (!stack.classList.contains('hero-sticky')) {
      heroInner.style.transform = '';
      heroInner.style.opacity = '';
      return;
    }
    const p = Math.min(Math.max(window.scrollY / heroSection.offsetHeight, 0), 1);
    heroInner.style.transform = `translateY(${-p * 60}px) scale(${1 - p * 0.08})`;
    heroInner.style.opacity = String(1 - p * 0.85);
  };

  // ========= PILL LABEL =========
  // Scroll position based: the pinned hero always "intersects", so an IntersectionObserver can't be used here.
  const pill = document.getElementById('sectionPill');
  const sections = [
    { id: 'home',          label: 'HOME' },
    { id: 'selected-work', label: 'WORK' },
    { id: 'about',         label: 'ABOUT' },
    { id: 'personal-work', label: 'PERSONAL WORK' },
    { id: 'books',         label: 'BOOKS' },
  ]
    .map(d => ({ ...d, el: document.getElementById(d.id) }))
    .filter(d => d.el);

  const updatePill = () => {
    if (!pill || sections.length === 0) return;
    const line = window.innerHeight * 0.4;
    let active = sections[0];
    sections.forEach(s => {
      if (s.id !== 'home' && s.el.getBoundingClientRect().top <= line) active = s;
    });
    if (pill.textContent !== active.label) pill.textContent = active.label;
  };

  // ========= CONTROLS CONTRAST =========
  // Switch the pill + menu button to a solid dark style while they sit over a light (.bio) section
  const controls = document.querySelector('.top-controls');
  const lightSections = [...document.querySelectorAll('.bio')];
  const updateControlsTheme = () => {
    if (!controls) return;
    const box = controls.getBoundingClientRect();
    const y = box.top + box.height / 2;
    const onLight = lightSections.some(s => {
      const r = s.getBoundingClientRect();
      return r.top <= y && r.bottom >= y;
    });
    controls.classList.toggle('on-light', onLight);
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateHeroPin();
      updateHeroFade();
      updatePill();
      updateControlsTheme();
      ticking = false;
    });
  };

  updateHeroPin();
  updateHeroFade();
  updatePill();
  updateControlsTheme();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { updateHeroPin(); onScroll(); });
  // The typing animation grows the hero after load, so re-check whether it still fits
  if (heroSection && 'ResizeObserver' in window) {
    new ResizeObserver(() => { updateHeroPin(); onScroll(); }).observe(heroSection);
  }
}

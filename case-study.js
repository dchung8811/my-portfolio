// Shared behavior for Selected Work case study pages:
// reading progress, active table-of-contents link, scroll reveal, image lightbox.
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========= READING PROGRESS =========
  const bar = document.querySelector('.progress');
  const nav = document.querySelector('.cs-nav');
  const hero = document.querySelector('.cs-hero');
  if (bar) {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
      // Hide the case-study counter once past the hero so it doesn't cover body text
      if (nav && hero) nav.classList.toggle('scrolled', window.scrollY > hero.offsetHeight - 80);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // ========= ACTIVE TOC LINK =========
  const links = [...document.querySelectorAll('.toc a')];
  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if (links.length && sections.length) {
    const setActive = (id) => {
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
    };
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(s => io.observe(s));
    setActive(sections[0].id);
  }

  // ========= SCROLL REVEAL =========
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          ro.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => ro.observe(el));
  }

  // ========= LIGHTBOX =========
  document.querySelectorAll('.shot img').forEach(img => {
    img.addEventListener('click', () => {
      const overlay = document.createElement('div');
      overlay.className = 'lightbox';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-label', img.alt || 'Screenshot');

      const big = document.createElement('img');
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      overlay.appendChild(big);

      const close = () => {
        overlay.remove();
        window.removeEventListener('keydown', onKey);
      };
      const onKey = (e) => { if (e.key === 'Escape') close(); };

      overlay.addEventListener('click', close);
      window.addEventListener('keydown', onKey);
      document.body.appendChild(overlay);
    });
  });
});

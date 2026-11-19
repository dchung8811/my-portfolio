// Staggered scroll reveal, counting up any [data-count] stats inside the
// block as it lands.

import { countUp } from './count-up.js';

export function initReveal() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========= STAGGERED REVEAL =========
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('js-motion');
  const ro = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(el => {
        setTimeout(() => countUp(el), parseInt(getComputedStyle(e.target).getPropertyValue('--delay')) || 0);
      });
      ro.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  reveals.forEach(el => ro.observe(el));
}

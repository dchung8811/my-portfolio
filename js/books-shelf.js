/* ---------- Favorite books carousel ----------
   Horizontal scrolling itself is native: the scroller is overflow-x:auto,
   so iOS gives real touch swipe with momentum and macOS gives two-finger
   trackpad swipe, both for free. This only adds the extras a native
   scroller does not provide: arrow buttons for plain-mouse users, and
   click-drag for mice without a horizontal wheel.                        */

export function initBooksShelf() {
  const shelf = document.querySelector('[data-shelf]');
  if (!shelf) return;

  const originals = [...shelf.querySelectorAll('.book-card')];
  const countEl = document.querySelector('[data-book-count]');
  if (countEl) countEl.textContent = originals.length;

  const arrows = document.querySelectorAll('[data-shelf-dir]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Endless loop -----
     Two more copies of the shelf are appended and the scroller is parked
     in the middle one. Crossing a copy boundary jumps scrollLeft back by
     exactly one set width, which is invisible because the pixels either
     side of the jump are identical. Copies are hidden from assistive tech
     and the tab order so each book is still announced once. */
  const COPIES = 2;
  for (let i = 0; i < COPIES; i++) {
    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      clone.dataset.clone = '';
      shelf.appendChild(clone);
    });
  }

  let setW = 0;
  function measure() {
    const card = originals[0];
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(shelf).columnGap) || 18;
    setW = originals.length * (card.getBoundingClientRect().width + gap);
    return setW;
  }

  // Looping and scroll snapping fight each other, so snap is dropped once
  // the loop is live. Without JS the CSS keeps its snap points.
  shelf.classList.add('is-looping');
  measure();
  shelf.scrollLeft = setW;

  // Returns the correction applied, so the drift accumulator can follow it.
  function keepInMiddle() {
    if (!setW) return 0;
    const x = shelf.scrollLeft;
    if (x >= setW * 2)       { shelf.scrollLeft = x - setW; return -setW; }
    if (x < setW * 0.5)      { shelf.scrollLeft = x + setW; return setW; }
    return 0;
  }

  /* ----- Gentle auto-rotation -----
     Paused while the reader is interacting, while the tab is hidden, and
     while the shelf is off screen. Skipped entirely under reduced motion,
     where the loop still works but only when the reader scrolls it. */
  const SPEED = 0.45;          // px per 60fps frame (~27px/s)
  let holds = 0, rafId = null, prev = 0, pos = null;
  const hold   = () => { holds++; };
  const release = () => { holds = Math.max(0, holds - 1); };

  /* scrollLeft is rounded when assigned, so adding a sub-pixel step to it
     each frame would be swallowed by the rounding and barely move. The
     fractional position is accumulated here instead and written out whole,
     resyncing whenever the reader has moved the shelf themselves. */
  function frame(ts) {
    const dt = prev ? Math.min(ts - prev, 50) : 16.7;
    prev = ts;
    if (holds) {
      pos = null;                       // reader is driving; resync later
    } else {
      if (pos === null || Math.abs(shelf.scrollLeft - pos) > 2) pos = shelf.scrollLeft;
      pos += SPEED * (dt / 16.7);
      shelf.scrollLeft = pos;
      pos += keepInMiddle();
    }
    rafId = requestAnimationFrame(frame);
  }
  function start() { if (rafId === null && !reduce) { prev = 0; rafId = requestAnimationFrame(frame); } }
  function stop()  { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

  ['pointerenter', 'focusin', 'touchstart'].forEach(e => shelf.addEventListener(e, hold, { passive: true }));
  ['pointerleave', 'focusout', 'touchend', 'touchcancel'].forEach(e => shelf.addEventListener(e, release, { passive: true }));
  document.addEventListener('visibilitychange', () => document.hidden ? hold() : release());

  // Only animate while the shelf is actually on screen.
  new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop(), { threshold: 0 }).observe(shelf);

  window.addEventListener('resize', () => {
    const before = setW;
    measure();
    if (before && setW) shelf.scrollLeft = (shelf.scrollLeft / before) * setW;
  });

  // One "page" is the visible width less a card peeking in, so the reader
  // keeps a visual anchor between jumps.
  function page() {
    const card = originals[0];
    const step = card ? card.getBoundingClientRect().width + 18 : 200;
    return Math.max(step, Math.floor(shelf.clientWidth / step) * step - step);
  }

  arrows.forEach(btn => {
    btn.addEventListener('click', () => {
      hold();
      shelf.scrollBy({
        left: Number(btn.dataset.shelfDir) * page(),
        behavior: reduce ? 'auto' : 'smooth'
      });
      // Let the smooth scroll land before the drift takes over again.
      setTimeout(release, 700);
    });
  });

  shelf.addEventListener('scroll', keepInMiddle, { passive: true });

  /* Click-drag for mice. Touch and trackpad are left to the browser so
     they keep their native momentum and snap behaviour. */
  let down = false, startX = 0, startScroll = 0, moved = 0;

  shelf.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true; moved = 0;
    startX = e.clientX;
    startScroll = shelf.scrollLeft;
  });

  shelf.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) {
      moved = Math.abs(dx);
      shelf.classList.add('is-dragging');
      shelf.setPointerCapture(e.pointerId);
    }
    if (moved) shelf.scrollLeft = startScroll - dx;
  });

  function endDrag(e) {
    if (!down) return;
    down = false;
    shelf.classList.remove('is-dragging');
    if (e && e.pointerId != null && shelf.hasPointerCapture(e.pointerId)) {
      shelf.releasePointerCapture(e.pointerId);
    }
    // Swallow the click that follows a real drag so it does not open a book.
    if (moved > 5) {
      shelf.addEventListener('click', ev => {
        ev.preventDefault(); ev.stopPropagation();
      }, { capture: true, once: true });
    }
  }

  shelf.addEventListener('pointerup', endDrag);
  shelf.addEventListener('pointercancel', endDrag);
  shelf.addEventListener('dragstart', e => e.preventDefault());
}

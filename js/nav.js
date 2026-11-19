// Full-screen menu overlay: open, close, and the Get in touch shortcut.

export function initMenu() {
  // Menu open/close
  const menu = document.getElementById('menuOverlay');
  const openBtn = document.getElementById('openMenu');
  const closeBtn = document.getElementById('closeMenu');
  // Close menu + navigate to Contact section
  const getInTouchBtn = document.getElementById('getInTouchBtn');
  getInTouchBtn?.addEventListener('click', () => {
    closeMenu();
    // wait a tick so the close animation/paint happens before scrolling
    setTimeout(() => {
      window.location.hash = '#contact';
    }, 0);
  });


  const openMenu = () => { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); };
  const closeMenu = () => { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); };

  openBtn?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);

  document.querySelectorAll('.menu-link').forEach(a => a.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });
}

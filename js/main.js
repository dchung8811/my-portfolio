// Entry point for the home page. Each feature lives in its own module and
// is started here, in the order the old inline script started them.
import { typeHero } from './hero.js';
import { initMenu } from './nav.js';
import { initScrollChrome } from './scroll-chrome.js';
import { initReveal } from './reveal.js';
import { initChromeWash } from './personal-work-wash.js';
import { initMoreProjects } from './more-projects.js';
import { initBooksShelf } from './books-shelf.js';

function start() {
  setTimeout(typeHero, 450);
  initMenu();
  initScrollChrome();
  initReveal();
  initChromeWash();
  initMoreProjects();
  initBooksShelf();
}

// Module scripts are deferred, so the DOM is normally ready by now; the
// check keeps this correct if the module is ever loaded some other way.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}

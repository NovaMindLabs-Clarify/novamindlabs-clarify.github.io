// Clarify landing — vanilla JS, no libraries.
// Independent modules, each initialised from a single DOMContentLoaded below.
// Task 2 adds: initHeroReveal(), initMobileNav().
// Task 3 adds: initScrollReveal() (benefit cards + how-it-works steps).

'use strict';

/**
 * initHeroReveal — the one orchestrated signature moment of the site.
 * Staggered entrance: heading/subhead fade+rise while the screenshot frame
 * scales/fades in, and faint blue shapes drift/converge toward the frame.
 *
 * The hero's *base* CSS state is the final, fully-visible state, so if JS is
 * disabled or prefers-reduced-motion is set, the content is readable with no
 * animation. We only opt in to the animation here when motion is allowed.
 */
function initHeroReveal() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Reduced motion (or no matchMedia support): leave the final state as-is.
  if (prefersReducedMotion) return;

  // Set the initial (hidden/scattered) state, then flip to revealed on the
  // next frame so the browser has a state to transition *from*.
  hero.classList.add('is-animating');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      hero.classList.add('is-revealed');
    });
  });
}

/**
 * initMobileNav — toggles the collapsed navigation panel on small screens.
 * Keyboard-operable (it's a real <button>), keeps aria-expanded in sync, and
 * closes on Escape or when a nav link is activated.
 */
function initMobileNav() {
  const toggle = document.querySelector('.header__toggle');
  const nav = document.querySelector('.header__nav');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    setOpen(!open);
  });

  // Close after choosing a destination.
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  // Close on Escape and return focus to the toggle.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' &&
        toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
}

/**
 * initScrollReveal — fade/rise-in for benefit cards and how-it-works steps
 * as they enter the viewport. Shared by both sections via the `.reveal`
 * marker class (one observer, not a parallel implementation per section).
 *
 * Base CSS state for `.reveal` elements is fully visible, so if JS is
 * disabled, or IntersectionObserver isn't supported, content simply shows
 * with no animation — never permanently hidden. When motion is allowed, we
 * opt elements into a hidden starting state here, then reveal each one the
 * first time it crosses into the viewport and stop observing it (no
 * re-triggering on scroll back up).
 */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Reduced motion, or no IntersectionObserver support: show everything now.
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  targets.forEach((el) => el.classList.add('is-hidden'));

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-hidden');
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroReveal();
  initMobileNav();
  initScrollReveal();
});

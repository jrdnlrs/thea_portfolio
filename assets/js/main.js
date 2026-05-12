/**
 * SOLÈNE — Model Portfolio
 * main.js
 *
 * Modules
 * ───────
 * 1.  Cursor
 * 2.  Navigation — sticky scroll
 * 3.  Scroll Reveal — IntersectionObserver
 * 4.  Gallery — filter tabs
 * 5.  Gallery — masonry stagger entrance
 * 6.  Lightbox
 * 7.  Editorial — drag-to-scroll
 * 8.  Form — client-side feedback
 * 9.  Init
 */

'use strict';


/* ═══════════════════════════════════════
   1. CURSOR
   Tracks mouse position and expands on
   interactive elements.
════════════════════════════════════════ */
const Cursor = (() => {

  const el = document.getElementById('cursor');
  if (!el) return null;

  const INTERACTIVE = 'a, button, .masonry-item, .editorial-card, .filter-btn, .download-btn';

  function move(e) {
    el.style.left = `${e.clientX}px`;
    el.style.top  = `${e.clientY}px`;
  }

  function expand()   { el.classList.add('expand'); }
  function contract() { el.classList.remove('expand'); }

  function init() {
    document.addEventListener('mousemove', move);

    document.querySelectorAll(INTERACTIVE).forEach(node => {
      node.addEventListener('mouseenter', expand);
      node.addEventListener('mouseleave', contract);
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════
   2. NAVIGATION — STICKY SCROLL
   Adds `.scrolled` class to nav after
   the user scrolls past a threshold.
════════════════════════════════════════ */
const Nav = (() => {

  const nav       = document.getElementById('nav');
  const THRESHOLD = 60; // px before class is applied

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > THRESHOLD);
  }

  function init() {
    if (!nav) return;
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  return { init };
})();


/* ═══════════════════════════════════════
   3. SCROLL REVEAL
   Uses IntersectionObserver to add
   `.visible` when elements enter the
   viewport.
════════════════════════════════════════ */
const ScrollReveal = (() => {

  const SELECTOR  = '.reveal';
  const THRESHOLD = 0.12;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: THRESHOLD }
  );

  function init() {
    document.querySelectorAll(SELECTOR).forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ═══════════════════════════════════════
   4. GALLERY — FILTER TABS
   Toggles `.active` state on filter
   buttons and hides/shows masonry items
   based on `data-category`.
════════════════════════════════════════ */
const GalleryFilter = (() => {

  const HIDDEN_CLASS = 'masonry-item--hidden';

  function setFilter(activeBtn, allBtns, allItems) {
    const target = activeBtn.dataset.filter;

    // Update button states
    allBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');

    // Show / hide items
    allItems.forEach(item => {
      const match = target === 'all' || item.dataset.category === target;
      item.classList.toggle(HIDDEN_CLASS, !match);
    });
  }

  function init() {
    const buttons = document.querySelectorAll('.filter-btn');
    const items   = document.querySelectorAll('.masonry-item');
    if (!buttons.length) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => setFilter(btn, buttons, items));
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════
   5. GALLERY — MASONRY STAGGER
   Applies a staggered entrance animation
   to masonry items on page load.
════════════════════════════════════════ */
const MasonryStagger = (() => {

  const BASE_DELAY   = 400;  // ms before first item animates
  const STEP_DELAY   = 70;   // ms between each item
  const DURATION     = 700;  // ms animation duration

  function init() {
    document.querySelectorAll('.masonry-item').forEach((el, i) => {
      const delay = BASE_DELAY + i * STEP_DELAY;

      el.style.opacity   = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity ${DURATION}ms ${delay}ms ease, transform ${DURATION}ms ${delay}ms ease`;

      // Trigger reflow then animate
      requestAnimationFrame(() => {
        setTimeout(() => {
          el.style.opacity   = '1';
          el.style.transform = 'translateY(0)';
        }, delay);
      });
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════
   6. LIGHTBOX
   Opens a modal viewer when masonry
   items are clicked. Supports keyboard
   navigation and backdrop close.
════════════════════════════════════════ */
const Lightbox = (() => {

  const lb        = document.getElementById('lightbox');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');
  const lbCounter = document.getElementById('lbCounter');

  let items   = [];
  let current = 0;

  // ── Open / close ──────────────────────
  function open(index) {
    current = index;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateCounter();
  }

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // ── Navigation ────────────────────────
  function prev() {
    current = (current - 1 + items.length) % items.length;
    updateCounter();
  }

  function next() {
    current = (current + 1) % items.length;
    updateCounter();
  }

  function updateCounter() {
    lbCounter.textContent = `${current + 1} / ${items.length}`;
  }

  // ── Keyboard handler ──────────────────
  function onKeyDown(e) {
    if (!lb.classList.contains('open')) return;

    const actions = {
      Escape:      close,
      ArrowLeft:   prev,
      ArrowRight:  next,
    };

    if (actions[e.key]) {
      e.preventDefault();
      actions[e.key]();
    }
  }

  // ── Init ──────────────────────────────
  function init() {
    if (!lb) return;

    items = document.querySelectorAll('.masonry-item');

    items.forEach((item, i) => {
      item.addEventListener('click', () => open(i));
    });

    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click',  prev);
    lbNext.addEventListener('click',  next);

    // Close on backdrop click
    lb.addEventListener('click', e => {
      if (e.target === lb) close();
    });

    document.addEventListener('keydown', onKeyDown);
  }

  return { init };
})();


/* ═══════════════════════════════════════
   7. EDITORIAL — DRAG TO SCROLL
   Enables click-drag horizontal
   scrolling on the editorial track.
════════════════════════════════════════ */
const DragScroll = (() => {

  const FRICTION = 1.4; // scroll multiplier

  function bind(el) {
    if (!el) return;

    let isDown   = false;
    let startX   = 0;
    let scrollLeft = 0;

    el.addEventListener('mousedown', e => {
      isDown     = true;
      startX     = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      el.style.cursor = 'grabbing';
    });

    el.addEventListener('mouseleave', () => {
      isDown = false;
      el.style.cursor = '';
    });

    el.addEventListener('mouseup', () => {
      isDown = false;
      el.style.cursor = '';
    });

    el.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      el.scrollLeft = scrollLeft - (x - startX) * FRICTION;
    });
  }

  function init() {
    bind(document.getElementById('hScroll'));
  }

  return { init };
})();


/* ═══════════════════════════════════════
   8. FORM — CLIENT-SIDE FEEDBACK
   Provides lightweight validation and
   user feedback on the booking form.
════════════════════════════════════════ */
const ContactForm = (() => {

  function validate(name, email, type) {
    if (!name.trim())          return 'Please enter your name.';
    if (!email.trim())         return 'Please enter your email.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address.';
    if (!type)                 return 'Please select a booking type.';
    return null;
  }

  function showFeedback(feedbackEl, message, isError = false) {
    feedbackEl.textContent = message;
    feedbackEl.style.color = isError ? '#e05a50' : 'var(--color-accent)';
  }

  function init() {
    const submitBtn  = document.getElementById('submitBtn');
    const feedback   = document.getElementById('formFeedback');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', () => {
      const name  = document.getElementById('fieldName').value;
      const email = document.getElementById('fieldEmail').value;
      const type  = document.getElementById('fieldType').value;

      const error = validate(name, email, type);

      if (error) {
        showFeedback(feedback, error, true);
        return;
      }

      // Success state — replace with real form submission logic
      showFeedback(feedback, 'Thank you — your inquiry has been sent.');
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Sent';
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════
   9. INIT
   Bootstraps all modules after the DOM
   is fully parsed.
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  Cursor.init();
  Nav.init();
  ScrollReveal.init();
  GalleryFilter.init();
  MasonryStagger.init();
  Lightbox.init();
  DragScroll.init();
  ContactForm.init();
});
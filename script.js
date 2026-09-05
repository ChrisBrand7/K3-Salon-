// K3 Hair & Beauty Salon — scroll reveal, header scroll state, mobile nav, testimonial carousel

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initScrollReveal(prefersReducedMotion);
  initMobileNav();
  initHeaderScroll();
  initTestimonials();
});

// ---------- Scroll reveal (single site-wide entrance treatment) ----------

function initScrollReveal(prefersReducedMotion) {
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

// ---------- Mobile nav (full-screen overlay) ----------

function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  // Scroll position is parked on body.top while locked, so the page cannot
  // scroll behind the overlay and lands exactly where it was on close.
  let savedScrollY = 0;

  function lock() {
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add('nav-open');
  }

  function unlock() {
    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    // jump back instantly — smooth scroll-behaviour would animate the restore
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, savedScrollY);
    root.style.scrollBehavior = prev;
  }

  function close() {
    if (!nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    unlock();
  }

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) lock(); else unlock();
  });

  nav.querySelectorAll('a').forEach(link => {
    // Close first so the scroll lock is released before the browser resolves
    // the #anchor jump, otherwise it scrolls a locked (fixed) body.
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // If the viewport grows past the mobile breakpoint while the menu is open,
  // drop back to the inline nav rather than leaving the body locked.
  window.matchMedia('(min-width: 781px)').addEventListener('change', (e) => {
    if (e.matches) close();
  });
}

// ---------- Header scroll state (transparent over hero, translucent after) ----------

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  if (!header || !hero) return;

  // Scroll-position fallback: keeps the header correct even if IntersectionObserver
  // callbacks are throttled (e.g. backgrounded/hidden tabs), and is the only path
  // for browsers without IntersectionObserver support.
  let ticking = false;
  const updateFromScroll = () => {
    ticking = false;
    const heroBottom = hero.getBoundingClientRect().bottom;
    header.classList.toggle('is-scrolled', heroBottom <= 80);
  };
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateFromScroll);
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  updateFromScroll();

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    });
  }, {
    threshold: 0,
    rootMargin: '-80px 0px 0px 0px'
  });

  observer.observe(hero);
}

// ---------- Testimonial carousel (vanilla JS, no library) ----------

function initTestimonials() {
  const root = document.querySelector('.testimonial');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.testimonial-slide'));
  const dots = Array.from(root.querySelectorAll('.testimonial-num'));
  if (!slides.length) return;

  const AUTO_INTERVAL = 4000;
  const MANUAL_HOLD = 10000;

  let index = slides.findIndex(s => s.classList.contains('is-active'));
  if (index < 0) index = 0;
  let timer = null;
  let paused = false;

  // Position a slide off-screen instantly (no transition) before it enters,
  // so it slides in from the correct side. Reduced-motion CSS overrides this
  // with !important, so this is a no-op visually in that case.
  function placeInstantly(slide, transform) {
    slide.style.transition = 'none';
    slide.style.transform = transform;
    void slide.offsetWidth; // force reflow so the instant position "sticks"
    slide.style.transition = '';
  }

  // NOTE: the track's height comes from CSS — all slides share one grid cell,
  // so it is always the height of the longest quote. It is deliberately never
  // touched from JS: driving it from the active slide reflows everything below
  // the carousel on every rotation (cumulative layout shift — the page visibly
  // jumped every 4 seconds).

  function show(nextIndex, direction = 'next') {
    const newIndex = (nextIndex + slides.length) % slides.length;
    if (newIndex === index) return;

    const oldSlide = slides[index];
    const newSlide = slides[newIndex];
    const forward = direction === 'next';

    placeInstantly(newSlide, forward ? 'translateX(100%)' : 'translateX(-100%)');

    oldSlide.classList.remove('is-active');
    if (dots[index]) {
      dots[index].classList.remove('is-active');
      dots[index].setAttribute('aria-selected', 'false');
    }

    // Trigger the actual slide on the next frame, after the instant
    // positioning above has been committed to the layout.
    requestAnimationFrame(() => {
      oldSlide.style.transform = forward ? 'translateX(-100%)' : 'translateX(100%)';
      newSlide.classList.add('is-active');
      newSlide.style.transform = 'translateX(0)';
    });

    index = newIndex;
    if (dots[index]) {
      dots[index].classList.add('is-active');
      dots[index].setAttribute('aria-selected', 'true');
    }
  }

  function next() { show(index + 1, 'next'); }

  // Auto-advance runs on a self-rescheduling timeout (not setInterval) so a
  // manual selection can hold for a longer, one-off delay before the normal
  // interval resumes.
  function scheduleNext(delay) {
    clearTimer();
    if (slides.length < 2 || paused) return;
    timer = window.setTimeout(() => {
      next();
      scheduleNext(AUTO_INTERVAL);
    }, delay);
  }

  function clearTimer() {
    if (timer) window.clearTimeout(timer);
    timer = null;
  }

  function start() { scheduleNext(AUTO_INTERVAL); }

  function pause() {
    paused = true;
    clearTimer();
  }

  function resume() {
    paused = false;
    scheduleNext(AUTO_INTERVAL);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i, i > index ? 'next' : 'prev');
      if (!paused) scheduleNext(MANUAL_HOLD);
    });
  });

  root.addEventListener('mouseenter', pause);
  root.addEventListener('mouseleave', resume);
  root.addEventListener('focusin', pause);
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget)) resume();
  });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(index + 1, 'next');
      if (!paused) scheduleNext(MANUAL_HOLD);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(index - 1, 'prev');
      if (!paused) scheduleNext(MANUAL_HOLD);
    }
  });

  start();
}

// K3 Hair & Beauty Salon — scroll reveal, header scroll state, mobile nav, testimonial carousel

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initScrollReveal(prefersReducedMotion);
  initMobileNav();
  initHeaderScroll();
  initTestimonials();
  initServiceSelection();
  initCartBadge();
  initWhatsAppGate();
});

// ---------- Shared cart storage ----------
// sessionStorage (not localStorage) so a selection made on the price list
// survives clicking Home/Reviews/Contact and coming back, but never lingers
// for a visitor who returns another day — it clears when the tab closes.

const CART_STORAGE_KEY = 'k3-cart';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '');
}

function readCart() {
  try {
    const raw = window.sessionStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeCart(items) {
  try {
    window.sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    /* storage unavailable (private browsing, quota) — cart just won't persist */
  }
}

// ---------- Booking time slots (office hours, Sunday differs) ----------
// Kept in sync with the hours printed in the footer: Mon–Sat 9:30am–5:30pm,
// Sunday 10:30am–4pm.

function formatTime12(hour, minute) {
  const period = hour < 12 ? 'am' : 'pm';
  let h = hour % 12;
  if (h === 0) h = 12;
  const m = minute === 0 ? '00' : String(minute).padStart(2, '0');
  return `${h}:${m}${period}`;
}

function buildTimeSlots(startHour, startMinute, endHour, endMinute, stepMinutes) {
  const slots = [];
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  for (let t = start; t <= end; t += stepMinutes) {
    slots.push(formatTime12(Math.floor(t / 60), t % 60));
  }
  return slots;
}

function timeSlotsForDate(dateValue) {
  const isSunday = dateValue ? new Date(`${dateValue}T00:00:00`).getDay() === 0 : false;
  return isSunday ? buildTimeSlots(10, 30, 16, 0, 30) : buildTimeSlots(9, 30, 17, 30, 30);
}

function populateTimeOptions(select, dateValue) {
  const previousValue = select.value;
  const slots = timeSlotsForDate(dateValue);

  select.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.disabled = true;
  placeholder.textContent = 'Select a time';
  select.appendChild(placeholder);

  slots.forEach(slot => {
    const opt = document.createElement('option');
    opt.value = slot;
    opt.textContent = slot;
    select.appendChild(opt);
  });

  select.value = slots.includes(previousValue) ? previousValue : '';
}

function formatDateForMessage(dateValue) {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ---------- Cart badge (pages without the full selection panel, e.g. index.html) ----------

function initCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;

  const cart = readCart();
  if (!cart.length) return;

  const sum = cart.reduce((total, item) => total + (item.priceValue || 0), 0);
  const anyFrom = cart.some(item => item.isFrom);
  const totalText = `${anyFrom ? 'from ' : ''}R${sum}`;

  document.getElementById('cart-badge-count').textContent = String(cart.length);
  document.getElementById('cart-badge-total').textContent = totalText;
  badge.setAttribute('aria-label', `View cart: ${cart.length} service${cart.length === 1 ? '' : 's'} selected, ${totalText}`);

  badge.hidden = false;
  document.body.classList.add('has-cart-badge');
}

// ---------- WhatsApp gate (empty-cart interstitial on every generic WhatsApp link) ----------
// Only intercepts when the cart is empty — a visitor who already has services
// selected clearly knows what they're doing and is left alone.

function initWhatsAppGate() {
  const gate = document.getElementById('whatsapp-gate-modal');
  const gateLinks = document.querySelectorAll('.js-whatsapp-gate');
  if (!gate || !gateLinks.length) return;

  const chooseBtn = document.getElementById('whatsapp-gate-choose');
  const skipBtn = document.getElementById('whatsapp-gate-skip');
  const onServicesPage = /services\.html$/.test(window.location.pathname);

  let lastFocused = null;
  let pendingLink = null;
  let gateOpen = false;

  function getFocusable() {
    return Array.from(gate.querySelectorAll('a[href], button:not([disabled])'))
      .filter(el => el.offsetParent !== null);
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeGate();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = getFocusable();
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openGate(link) {
    pendingLink = link;
    lastFocused = link;
    gateOpen = true;

    gate.hidden = false;
    void gate.offsetWidth;
    gate.classList.add('is-visible');
    document.addEventListener('keydown', onKeydown);

    const focusables = getFocusable();
    if (focusables.length) focusables[0].focus();
  }

  function closeGate() {
    if (!gateOpen) return;
    gateOpen = false;
    gate.classList.remove('is-visible');
    window.setTimeout(() => { gate.hidden = true; }, 260);
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  gateLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (readCart().length > 0) return; // already mid-booking — don't interrupt
      e.preventDefault();
      openGate(link);
    });
  });

  gate.querySelectorAll('[data-gate-close]').forEach(el => el.addEventListener('click', closeGate));

  chooseBtn.addEventListener('click', () => {
    closeGate();
    // already on the price list — just let them start picking services
    // rather than reloading the page they're standing on
    if (!onServicesPage) window.location.href = 'services.html';
  });

  skipBtn.addEventListener('click', () => {
    const link = pendingLink;
    closeGate();
    if (!link) return;
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.target = link.getAttribute('target') || '_blank';
    a.rel = link.getAttribute('rel') || 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
}

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
  if (!header) return;

  // Pages without a hero (services.html) have no dark image for the header to
  // sit over, so it stays in its scrolled treatment from the top — and the
  // header/mobile WhatsApp buttons (gated on this same flag) show right away
  // since there's no hero CTA there for them to compete with.
  if (!hero) {
    header.classList.add('is-scrolled');
    document.body.classList.add('is-past-hero');
    return;
  }

  // Scroll-position fallback: keeps the header correct even if IntersectionObserver
  // callbacks are throttled (e.g. backgrounded/hidden tabs), and is the only path
  // for browsers without IntersectionObserver support.
  let ticking = false;
  const updateFromScroll = () => {
    ticking = false;
    const heroBottom = hero.getBoundingClientRect().bottom;
    const past = heroBottom <= 80;
    header.classList.toggle('is-scrolled', past);
    document.body.classList.toggle('is-past-hero', past);
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
      const past = !entry.isIntersecting;
      header.classList.toggle('is-scrolled', past);
      document.body.classList.toggle('is-past-hero', past);
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

// ---------- Service selection & WhatsApp booking (services.html) ----------

function initServiceSelection() {
  const rows = Array.from(document.querySelectorAll('.price-row'));
  const panel = document.getElementById('selection-panel');
  if (!rows.length || !panel) return;

  const WHATSAPP_NUMBER = '27720532326';

  // A name is ambiguous (needs its category spelled out) when it repeats
  // under more than one heading, e.g. "Eyebrow" under both Threading and
  // Waxing at different prices.
  const nameCategories = new Map();
  rows.forEach(row => {
    const name = row.querySelector('.price-name').textContent.trim();
    const category = row.closest('.price-group').querySelector('h2').textContent.trim();
    const key = name.toLowerCase();
    if (!nameCategories.has(key)) nameCategories.set(key, new Set());
    nameCategories.get(key).add(category);
  });

  const ICON_MARKUP =
    '<span class="icon-plus"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M8 2v12M2 8h12"/></svg></span>' +
    '<span class="icon-check"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M3 8.5l3.2 3.2L13 4.5"/></svg></span>';

  // Restored from sessionStorage so a cart started here survives a trip to
  // Home/Reviews/Contact and back — ids are content-based (category + name)
  // rather than an incrementing counter so they still match on the next load.
  const storedIds = new Set(readCart().map(item => item.id));
  const selections = new Map();

  rows.forEach(row => {
    const nameEl = row.querySelector('.price-name');
    const amtEl = row.querySelector('.price-amt');
    if (!nameEl || !amtEl) return;

    const name = nameEl.textContent.trim();
    const category = row.closest('.price-group').querySelector('h2').textContent.trim();
    const priceLabel = amtEl.textContent.trim();
    const isFrom = amtEl.classList.contains('is-from');
    const priceValue = parseInt(priceLabel.replace(/[^\d]/g, ''), 10) || 0;
    const ambiguous = nameCategories.get(name.toLowerCase()).size > 1;
    const label = ambiguous ? `${name} (${category})` : name;

    const id = `${slugify(category)}--${slugify(name)}`;
    row.dataset.serviceId = id;
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-pressed', storedIds.has(id) ? 'true' : 'false');
    row.setAttribute('aria-label', `${label}, ${priceLabel}`);

    const icon = document.createElement('span');
    icon.className = 'price-select-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = ICON_MARKUP;
    row.prepend(icon);

    const service = { id, label, priceLabel, priceValue, isFrom };

    if (storedIds.has(id)) {
      selections.set(id, service);
      row.classList.add('is-selected');
    }

    function toggle() {
      if (selections.has(id)) {
        selections.delete(id);
        row.classList.remove('is-selected');
        row.setAttribute('aria-pressed', 'false');
      } else {
        selections.set(id, service);
        row.classList.add('is-selected');
        row.setAttribute('aria-pressed', 'true');
      }
      renderSelections();
    }

    row.addEventListener('click', toggle);
    row.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    });
  });

  function removeSelection(id) {
    selections.delete(id);
    const row = rows.find(r => r.dataset.serviceId === id);
    if (row) {
      row.classList.remove('is-selected');
      row.setAttribute('aria-pressed', 'false');
    }
    renderSelections();
  }

  function clearAll() {
    selections.forEach((service, id) => {
      const row = rows.find(r => r.dataset.serviceId === id);
      if (row) {
        row.classList.remove('is-selected');
        row.setAttribute('aria-pressed', 'false');
      }
    });
    selections.clear();
    renderSelections();
  }

  function computeTotals() {
    let sum = 0;
    let anyFrom = false;
    selections.forEach(s => {
      sum += s.priceValue;
      if (s.isFrom) anyFrom = true;
    });
    return { sum, anyFrom };
  }

  function formatTotal(sum, anyFrom) {
    return `${anyFrom ? 'from ' : ''}R${sum}`;
  }

  // ---- panel / bar / sheet chrome ----

  const bar = document.getElementById('selection-bar');
  const sheet = document.getElementById('selection-sheet');
  const backdrop = document.getElementById('selection-backdrop');
  const listDesktop = document.getElementById('selection-list-desktop');
  const listMobile = document.getElementById('selection-list-mobile');
  const countDesktop = document.getElementById('selection-count-desktop');
  const countMobile = document.getElementById('selection-count-mobile');
  const totalDesktop = document.getElementById('selection-total-desktop');
  const totalMobile = document.getElementById('selection-total-mobile');
  const totalMobileSheet = document.getElementById('selection-total-mobile-sheet');
  const clearDesktop = document.getElementById('selection-clear-desktop');
  const clearMobile = document.getElementById('selection-clear-mobile');
  const bookDesktop = document.getElementById('selection-book-desktop');
  const bookMobile = document.getElementById('selection-book-mobile');
  const barToggle = document.getElementById('selection-bar-toggle');
  const sheetClose = document.getElementById('selection-sheet-close');
  const comboWrapDesktop = document.getElementById('selection-combo-wrap-desktop');
  const comboWrapMobile = document.getElementById('selection-combo-wrap-mobile');
  const COMBO_THRESHOLD = 3;

  let sheetOpen = false;

  // Fades an element in/out over the site's 250ms motion duration without
  // leaving it in the layout or tab order while hidden — mirrors the
  // testimonial track's instant-position-then-transition technique.
  function showEl(el) {
    clearTimeout(el._hideTimer);
    el.hidden = false;
    void el.offsetWidth;
    el.classList.add('is-visible');
  }

  function hideEl(el) {
    el.classList.remove('is-visible');
    el._hideTimer = window.setTimeout(() => { el.hidden = true; }, 260);
  }

  function renderList(container) {
    container.innerHTML = '';
    selections.forEach(s => {
      const li = document.createElement('li');
      li.className = 'selection-item';

      const name = document.createElement('span');
      name.className = 'selection-item-name';
      name.textContent = s.label;

      const price = document.createElement('span');
      price.className = 'selection-item-price';
      price.textContent = s.priceLabel;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'selection-item-remove';
      remove.setAttribute('aria-label', `Remove ${s.label}`);
      remove.innerHTML = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M3 3l10 10M13 3L3 13"/></svg>';
      remove.addEventListener('click', () => removeSelection(s.id));

      li.append(name, price, remove);
      container.appendChild(li);
    });
  }

  function renderSelections() {
    const count = selections.size;
    const { sum, anyFrom } = computeTotals();
    const totalText = formatTotal(sum, anyFrom);
    const countText = `${count} selected`;

    renderList(listDesktop);
    renderList(listMobile);

    countDesktop.textContent = countText;
    countMobile.textContent = countText;
    totalDesktop.textContent = count ? `Total: ${totalText}` : '';
    totalMobile.textContent = count ? totalText : '';
    totalMobileSheet.textContent = count ? `Total: ${totalText}` : '';

    document.body.classList.toggle('has-selection', count > 0);

    const comboQualified = count >= COMBO_THRESHOLD;
    comboWrapDesktop.classList.toggle('is-active', comboQualified);
    comboWrapMobile.classList.toggle('is-active', comboQualified);

    if (count > 0) {
      showEl(panel);
      showEl(bar);
    } else {
      hideEl(panel);
      hideEl(bar);
      closeSheet();
    }

    writeCart(Array.from(selections.values()));
  }

  function openSheet() {
    sheetOpen = true;
    showEl(sheet);
    showEl(backdrop);
    barToggle.setAttribute('aria-expanded', 'true');
  }

  function closeSheet() {
    if (!sheetOpen) return;
    sheetOpen = false;
    hideEl(sheet);
    hideEl(backdrop);
    barToggle.setAttribute('aria-expanded', 'false');
  }

  barToggle.addEventListener('click', () => (sheetOpen ? closeSheet() : openSheet()));
  sheetClose.addEventListener('click', closeSheet);
  backdrop.addEventListener('click', closeSheet);
  clearDesktop.addEventListener('click', clearAll);
  clearMobile.addEventListener('click', () => { clearAll(); closeSheet(); });

  // ---- booking modal ----

  const modal = document.getElementById('booking-modal');
  const modalSummaryList = document.getElementById('modal-summary-list');
  const modalSummaryTotal = document.getElementById('modal-summary-total');
  const bookingForm = document.getElementById('booking-form');
  const nameInput = document.getElementById('booking-name');
  const dayInput = document.getElementById('booking-day');
  const timeInput = document.getElementById('booking-time');
  const notesInput = document.getElementById('booking-notes');
  const nameError = document.getElementById('booking-name-error');
  const dayError = document.getElementById('booking-day-error');
  const timeError = document.getElementById('booking-time-error');
  const modalCombo = document.getElementById('modal-combo');

  // today's date as YYYY-MM-DD in the visitor's own timezone (not UTC, which
  // toISOString would give and could roll back to yesterday in the evening)
  const todayValue = (() => {
    const d = new Date();
    const tzOffsetMs = d.getTimezoneOffset() * 60000;
    return new Date(d - tzOffsetMs).toISOString().slice(0, 10);
  })();
  dayInput.min = todayValue;

  dayInput.addEventListener('change', () => {
    populateTimeOptions(timeInput, dayInput.value);
  });
  populateTimeOptions(timeInput, dayInput.value);

  let lastFocused = null;
  let modalOpen = false;

  function getFocusable() {
    return Array.from(modal.querySelectorAll('a[href], button:not([disabled]), input, textarea, select'))
      .filter(el => el.offsetParent !== null);
  }

  function onModalKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = getFocusable();
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function setFieldError(input, errorEl, show) {
    input.closest('.form-field').classList.toggle('has-error', show);
    errorEl.hidden = !show;
    input.setAttribute('aria-invalid', show ? 'true' : 'false');
  }

  [
    [nameInput, nameError],
    [dayInput, dayError],
    [timeInput, timeError]
  ].forEach(([input, errorEl]) => {
    input.addEventListener('input', () => {
      if (input.value.trim()) setFieldError(input, errorEl, false);
    });
  });

  function openModal(triggerEl) {
    closeSheet();
    lastFocused = triggerEl || document.activeElement;

    modalSummaryList.innerHTML = '';
    selections.forEach(s => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = s.label;
      const price = document.createElement('span');
      price.className = 'item-price';
      price.textContent = s.priceLabel;
      li.append(name, price);
      modalSummaryList.appendChild(li);
    });
    const { sum, anyFrom } = computeTotals();
    modalSummaryTotal.textContent = `Estimated total: ${formatTotal(sum, anyFrom)}`;
    modalCombo.hidden = selections.size < COMBO_THRESHOLD;

    modalOpen = true;
    modal.hidden = false;
    void modal.offsetWidth;
    modal.classList.add('is-visible');
    document.addEventListener('keydown', onModalKeydown);

    const focusables = getFocusable();
    if (focusables.length) focusables[0].focus();
  }

  function closeModal() {
    if (!modalOpen) return;
    modalOpen = false;
    modal.classList.remove('is-visible');
    window.setTimeout(() => { modal.hidden = true; }, 260);
    document.removeEventListener('keydown', onModalKeydown);
    if (lastFocused) lastFocused.focus();
  }

  modal.querySelectorAll('[data-modal-close]').forEach(el => el.addEventListener('click', closeModal));
  [bookDesktop, bookMobile].forEach(btn => btn.addEventListener('click', (e) => openModal(e.currentTarget)));

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const day = dayInput.value;
    const time = timeInput.value;
    const notes = notesInput.value.trim();

    setFieldError(nameInput, nameError, !name);
    setFieldError(dayInput, dayError, !day);
    setFieldError(timeInput, timeError, !time);

    if (!name || !day || !time) {
      (!name ? nameInput : (!day ? dayInput : timeInput)).focus();
      return;
    }

    const { sum, anyFrom } = computeTotals();
    const lines = [
      "Hi K3, I'd like to book.",
      '',
      `Name: ${name}`,
      `Preferred day: ${formatDateForMessage(day)}`,
      `Preferred time: ${time}`,
      '',
      'Services:',
      ...Array.from(selections.values()).map(s => `- ${s.label} (${s.priceLabel})`),
      '',
      `Estimated total: ${formatTotal(sum, anyFrom)}`
    ];
    if (notes) {
      lines.push('', notes);
    }

    const message = lines.join('\n');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();

    closeModal();
  });

  // Reflects any selections just restored from sessionStorage — shows the
  // panel/bar, combo banner and totals immediately if the visitor is
  // returning to the price list with items already in their cart.
  renderSelections();
}

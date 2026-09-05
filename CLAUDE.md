# Design System — Client Sites

This file defines the house style for websites built in this repo. Read it before writing any markup or CSS. When a decision is not covered here, choose the more restrained option.

The target is premium small-business sites for South African clients — salons, studios, boutiques, hospitality. The reference standard is high-end European brand sites: David Mallett, Abel, Aesop. Restrained, editorial, confident. Not "small business template with a nice photo".

---

## 1. Non-negotiables

These apply to every build without exception.

- **Sharp geometry.** `border-radius: 0` on everything — buttons, images, cards, inputs, form fields, gallery items, video containers. Rounded corners read as consumer software, not luxury. The only permitted exception is a circular social icon or avatar, where the shape is fully round by intent rather than softened.
- **WhatsApp booking is the primary conversion action.** Present in the header, in the hero, and as a persistent mobile element. Uses `wa.me` deep links with a pre-filled message.
- **Mobile is the primary viewport.** Most South African salon and boutique traffic is mobile. Design mobile first, then scale up. Test every change at 375px width before considering it done.
- **No stock-photo filler.** If the client has not supplied an image for a slot, leave the slot out rather than inserting generic stock. A shorter honest page beats a padded one.
- **Every image needs an explicit `loading` and dimension strategy.** Hero image eager, everything below lazy. Set width/height or aspect-ratio to prevent layout shift.

---

## 2. Typography

### Approved pairings

Pick one pairing per project and commit to it. Do not mix across pairings. All fonts listed are free on Google Fonts and must be loaded via `<link>` with `display=swap`.

**Pairing A — Editorial Classic**
Display: Cormorant Garamond (300/400/500)
Body & labels: Jost (300/400/500)
Feel: soft, literary, feminine. Best for salons, spas, florists, wellness.

**Pairing B — High Contrast Fashion**
Display: Prata (400) or Bodoni Moda (400/500)
Body & labels: Manrope (300/400/500)
Feel: sharp, fashion-editorial, high contrast. Best for hair studios, boutiques, photographers.

**Pairing C — Quiet Modern**
Display: Forum (400)
Body & labels: Poppins (300/400)
Feel: understated, organic, calm. Best for skincare, natural products, wellness, cafés.

**Pairing D — Architectural**
Display: Playfair Display (400/500)
Body & labels: Josefin Sans (300/400)
Feel: structured, slightly art-deco. Best for barbers, tattoo studios, interiors.

Commercial equivalents, for reference only — do not use without a licence: Caviar Serif (→ use Prata), Eleven Eleven (→ use Manrope), Caviar Dreams (→ use Josefin Sans), Amoret (→ omit; script faces are rarely worth the licence).

### Type rules

- **Two families maximum.** One display, one sans. Never a third.
- **Display faces are for headings and the brand mark only.** Never for body copy, never for buttons, never for navigation.
- **Body copy: 16–18px, line-height 1.6–1.75, max-width 65–75 characters.** Serif body copy gets the higher line-height.
- **Small type in the footer.** 12–13px. This is deliberate and is what makes large footers read as premium rather than bloated.
- **Letter-spacing:** wide (0.12–0.2em) on small caps labels and buttons; tight (-0.01 to -0.02em) on large display headings; normal on body.
- **Weight discipline.** Display headings sit at 400–500, not 700. Weight comes from size and colour contrast, not from bolding. Body at 300–400.

### The eyebrow label rule

Do not put a small all-caps label above every section heading. A page with "OUR MENU", "VISIT US", "OUR STORY", "GOOGLE REVIEWS" stacked above each heading is the single clearest tell of a generated template, and none of the reference sites do it.

Use at most **one** eyebrow label on the entire page, and only where it carries real information the heading does not. Otherwise let the heading stand alone. If a section genuinely needs orientation, a short line of body copy beneath the heading does the job better.

---

## 3. Colour

- **4–6 values maximum**, defined as CSS custom properties at `:root`. No inline hex.
- Structure: one background, one deep neutral for text, one accent, one surface tone, one hairline/border tone.
- **Contrast floor.** Body text against its background must hit at least 4.5:1. Large display text at least 3:1. Faint low-contrast type reads as cheap, not subtle — this was a recurring correction on earlier builds.
- **The accent appears rarely.** Metallic or saturated accents lose their value through repetition. Use for one or two elements per viewport at most.
- **Avoid the default AI palette.** Warm cream near `#F4F1EA` with a high-contrast serif and a terracotta or gold accent is currently the most-generated look on the web. If the client's brand does not specifically call for it, choose something else: cool greys, bone and ink, off-white and deep green, warm charcoal and sand.

---

## 4. Layout & spacing

- **Spacing scale.** Use a consistent scale and nothing between the steps: 8, 16, 24, 32, 48, 64, 96, 128, 160px. Define as custom properties.
- **Section padding.** 96–160px vertical on desktop, 64–80px on mobile. Generous vertical space is the cheapest way to signal premium.
- **Content max-width** 1280–1440px with 5–8% side gutters. Full-bleed only for hero and feature imagery.
- **Alignment consistency.** Within any column, every element shares one left edge — label, heading, body, button, social icons. Mixed centre/left alignment inside a single block is a defect.
- **Never stack two full-bleed images directly against each other.** Two dark photographic sections touching creates a hard horizontal seam that reads as a mistake. Separate them with a solid-colour section, or fade one into the other with a gradient.

### The alternating editorial block

This is the default pattern for showcasing work, products, people, or story content. It replaces the grid gallery.

Full-width row, split roughly 50/50 or 60/40. Image on one side, text on the other. The next row reverses the sides. Continue alternating.

```
┌─────────────────┬─────────────────┐
│                 │  Heading        │
│     IMAGE       │  Body copy      │
│                 │  Optional link  │
├─────────────────┼─────────────────┤
│  Heading        │                 │
│  Body copy      │     IMAGE       │
│  Optional link  │                 │
├─────────────────┼─────────────────┤
│                 │  Heading        │
│     IMAGE       │  Body copy      │
└─────────────────┴─────────────────┘
```

**Each row occupies roughly its own full viewport** — 85–95vh minimum height on desktop. You scroll, you get one image and one write-up; you scroll again, you get the next. Two rows sharing a single screen leaves neither with any presence. The image fills its half completely, edge to edge and top to bottom of the row, with `object-fit: cover`. Rows sit flush against each other and against the sections above and below, with no gap anywhere.

The text block sits **centred in its half, both horizontally and vertically** — equal space to left and right of the block, equal space above and below it. The block itself stays narrow (see the measure below), so centring it leaves a generous margin on both sides rather than filling the column. The type inside it remains left-aligned: heading, body and descriptor share one left edge, so give every element in the block the same width rather than centring each one independently. Generous internal padding, at least 64px and ideally 96px. On mobile the pattern collapses to a single column, image above text, in every row, and the image takes a fixed aspect ratio (4:5) rather than a slice of the viewport.

Use 3–5 rows. Each needs real content: a hairdresser profile, a product, a specific service, the salon interior. If there isn't enough real content for three rows, use fewer rows rather than padding with filler.

Every image in the block uses the same fixed aspect ratio and the same rendered height across all rows (shared row height, `object-fit: cover`) — mismatched image proportions between rows is a defect. The heading, body copy, and descriptor live inside the text column itself, left-aligned with each other, never centred above the row as a standalone element.

**Type scale — deliberately inverted from the usual web default.** A large display heading over comfortable body copy reads like a blog post; the reference standard is the opposite, and that contrast is what makes the block feel like print. This is a documented exception to the 16–18px body rule in §2.

- **Heading:** 28–32px desktop, display face at weight 400. Only modestly larger than the body — the hierarchy comes from the change of typeface, not from scale.
- **Body:** 13–14px desktop, sans at weight 300, line-height ~1.65. Small and tightly set.
- **Measure:** constrain the text column to roughly 380–420px. It must never span the full half-width of the row. (At 13–14px this runs a little long by the §2 character count; the narrow column is the point, so prefer the stated pixel measure and let the character count sit high.)
- **Gap** between heading and body: 20–24px.
- **Descriptor line** beneath the body paragraph, signing the copy off: same sans, smaller again, letter-spaced, uppercase, muted colour. It carries a real fact — the business name and suburb, or services already listed elsewhere on the site. Never invent staff names, products, or claims to fill it.

Reserve the tight grid gallery for actual overflow imagery, placed lower down the page, and even then use a consistent aspect ratio with a uniform gap.

### Footer

Large, quiet, and structured. This is a significant part of the premium feel and is currently under-built on most small-business sites.

- **120–200px vertical padding.** Substantially taller than feels necessary.
- **Multi-column on desktop**, 3–5 columns: brand mark, navigation links, secondary links, contact details, and optionally a newsletter field.
- **Type at 12–13px** throughout, with generous line-height (1.8–2.0) and moderate letter-spacing on link lists.
- **No boxes, no cards, no dividers between columns.** Whitespace does the separating.
- **A single hairline rule** above the bottom bar is permitted.
- **Bottom bar:** copyright, legal links, and credit. Smallest type on the page.
- Collapses to a single centred column on mobile with clear vertical spacing between groups.
- **Every element in the footer must be genuinely interactive.** Social icons link to the real profiles, the address links to a real maps search, phone numbers use `tel:`, the booking link uses the real `wa.me` link, and nav items are real anchor links — no decorative or dead links. Each gets a visible hover state and a matching `:focus-visible` state.

---

## 5. Motion

Scroll animation is expected on these builds and is part of what justifies the price. But motion must feel intentional rather than sprinkled.

### Rules

- **One entrance treatment for the whole site.** A short fade with a small upward translate (16–24px), 500–700ms, `cubic-bezier(0.16, 1, 0.3, 1)`. Use the same treatment everywhere. Do not mix fade-up with slide-in with scale-in on different sections.
- **Trigger with `IntersectionObserver`** at roughly 15–20% visibility, and **unobserve after firing** so elements do not re-animate on scroll-up.
- **Stagger within a group only.** Items in a row or grid stagger 60–100ms apart. Sections themselves do not stagger against each other.
- **Reserve one larger moment.** A single more deliberate effect — a slow hero image scale, a parallax offset on one feature image, a mark that draws in on load. One per site, not one per section.
- **Hover states are quick.** 150–250ms. Colour and opacity shifts, subtle underline reveals, and a small `translateY` lift with a soft shadow on cards and buttons are all permitted — keep the lift subtle (2–4px) and the shadow soft. Every interactive element (cards, buttons, links, nav items, icons, gallery/editorial images) must have a visible hover response, and a matching `:focus-visible` state for keyboard users.
- **Respect `prefers-reduced-motion: reduce`.** All entrance animation disabled, content visible immediately. This is not optional.
- **Never animate `top`, `left`, `width`, or `height`.** Only `transform` and `opacity`.

---

## 6. Header

Fixed to the top, and its treatment changes on scroll.

**Over the hero:** transparent or near-transparent background, no border, no shadow. Link colour chosen for contrast against the hero image.

**After scrolling past the hero:** a translucent background using `backdrop-filter: blur(12px)` with a background alpha around 0.7–0.85 — content beneath must remain visibly present through it. A solid opaque bar is wrong; so is a bar so transparent the links become unreadable. Add a hairline bottom border at low opacity. No drop shadow.

Transition between states over 300–400ms on `background-color`, `backdrop-filter` and `border-color`. Trigger at roughly 80% of viewport height, or on the hero's intersection.

Link and brand-mark colours must transition too, since the background is moving from image to light. Include a `backdrop-filter` fallback: on unsupported browsers use a higher background alpha.

Height 72–88px desktop, 60–68px mobile. Mobile navigation is a full-screen overlay, not a dropdown panel.

---

## 7. Testimonials

Do not build testimonials as a row of separate cards. Card grids leave orphaned items when the count is not divisible by the column count, and the boxes fragment what should read as a single confident statement.

**Default treatment:** one quote at a time, left-aligned — not centred. It sits in roughly the left half to two-thirds of the content width, with the remaining space left open; this reads as an editorial pull quote, not a banner. A section heading is permitted above the quote — unlike most sections, this is not competing with an eyebrow — but keep it moderate: display face, noticeably smaller than a standard section title, and left-aligned so it shares the same left edge as the quote and the indicators beneath it, rather than centred as a standalone element. The quote itself is small and quiet, never a display headline: body/sans face, regular weight (300), not italic, around 17–19px with generous line-height. Attribution beneath in the same sans face, smaller again, letter-spaced, muted colour. No star rating and no quotation-mark graphics — they read as clutter at this scale.

Heading, quote, attribution and indicators sit close together as one tight block, not spread across the section — moderate, scale-consistent spacing between each, never the section's own large vertical rhythm. The whole block should sit comfortably within one viewport height on desktop.

**The quote container's height must be fixed to the longest quote in the set, and must never be driven by whichever quote is currently active.** Resizing it per quote — whether from CSS or by setting a height in JS on each rotation — reflows everything below the carousel on every tick, which is cumulative layout shift: on an auto-rotating carousel the entire page visibly jumps every few seconds, even for a reader sitting far below it. That is a far worse defect than the dead space under the shorter quotes, which is the accepted cost of this pattern. The cleanest implementation is to stack every quote in a single CSS grid cell (`display: grid` on the track, `grid-area: 1 / 1` on each quote): the browser then sizes the track to the tallest quote at every viewport width automatically, with no hardcoded per-breakpoint pixel values to clip when a webfont swaps in, and the height is identical whichever quote is active. Verify by cycling all quotes at each breakpoint and confirming nothing below the block moves by a single pixel.

Rotate automatically every 4 seconds, sliding horizontally (`transform: translateX`, 500–600ms, the site's standard easing) — the outgoing quote slides out one side as the incoming quote slides in from the other, not a cross-fade. When a visitor manually selects a quote, hold it for 10 seconds before automatic rotation resumes. Under `prefers-reduced-motion`, switch instantly with no transform. Pause on hover and on focus.

Indicators are numbered (01, 02, 03…), not dots — small, quiet, tabular-figure type in a horizontal row at the lower left, aligned with the quote's left edge. The active number carries a small leading dot and full colour; inactive numbers sit at low opacity. Numbers are clickable and keyboard-focusable with a visible hover/focus state, and arrow keys move between quotes.

No surrounding box, no shadow, no border. The quote sits on the section background, close beneath its heading rather than centred in a sea of space.

Vanilla JS, no carousel library.

---

## 8. Build conventions

- Semantic HTML: `header`, `nav`, `main`, `section`, `footer`. Every section gets a stable `id` for anchor navigation.
- CSS custom properties at `:root` for all colour, type scale, and spacing values. No magic numbers scattered through the stylesheet.
- Vanilla JS only unless the project specifically calls for a framework. No jQuery, no carousel or animation libraries.
- Images: WebP with a JPEG fallback where practical. Hero under 300KB, gallery images under 150KB each.
- **Filenames are lowercase with hyphens, no spaces.** macOS is case-insensitive and Vercel is not — mismatched case is a common cause of images that work locally and break in production.
- `.gitignore` must cover: `.DS_Store`, `node_modules/`, `.env`, `.claude/`, and raw source media (`*.mov`, `*.psd`, `*.ai`). Only commit assets the site actually references.
- Visible keyboard focus states on every interactive element. Never `outline: none` without a replacement.
- Every image needs meaningful `alt` text. If an image fails to load, the alt text becomes visible — so it must read as sensible prose, not a filename.

---

## 9. Verification before handoff

Confirm each of these explicitly rather than assuming:

- Every image resolves on the deployed URL, not just locally
- All WhatsApp links open the correct number with the pre-filled message intact
- Business hours, address, and phone number are identical everywhere they appear
- No text is clipped at a section boundary — check descenders on headings against background transitions
- No duplicate headings or labels anywhere on the page
- Section order in the DOM matches the intended order
- Site renders correctly at 375px, 768px, 1440px
- Animations do not fire on `prefers-reduced-motion`
- No orphaned grid items leaving an empty cell
- Hard-refresh the deployed site before reviewing — browser caching regularly disguises successful changes as failures

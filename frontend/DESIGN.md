---
name: PHX Home Loan
description: A warm, locally grounded mortgage guidance system built around a trusted advisor.
colors:
  advisor-teal: "#1f6e8c"
  deep-advisor-teal: "#18576f"
  mesa-copper: "#b4552d"
  midnight-navy: "#0c1329"
  trust-navy: "#131c3b"
  layered-navy: "#1c2237"
  warm-paper: "#f7f4ee"
  soft-ivory: "#fdfcf9"
  paper-light: "#fbf9f4"
  clear-white: "#ffffff"
  border-sand: "#e7e1d6"
  strong-border-sand: "#c9c2b4"
  input-sand: "#d8d1c3"
  divider-sand: "#ddd5c4"
  body-ink: "#3d4356"
  alternate-body-ink: "#454b5e"
  muted-ink: "#5b6172"
  faint-ink: "#8a8f9c"
  rating-gold: "#e8a33d"
  label-peach: "#feb77d"
typography:
  display:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(3rem, 5vw, 4.125rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "normal"
  headline:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(1.875rem, 3vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  title:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.3125rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  lead:
    fontFamily: "Archivo, Helvetica, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.78
    letterSpacing: "normal"
  body:
    fontFamily: "Archivo, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo, Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.22em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  control: "9px"
  action: "10px"
  xl: "12px"
  card: "16px"
  feature: "24px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section-mobile: "80px"
  section-desktop: "96px"
components:
  button-primary:
    backgroundColor: "{colors.advisor-teal}"
    textColor: "{colors.clear-white}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "12px 22px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.deep-advisor-teal}"
    textColor: "{colors.clear-white}"
    rounded: "{rounded.action}"
  button-outline:
    backgroundColor: "{colors.clear-white}"
    textColor: "{colors.trust-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "12px 22px"
    height: "44px"
  input:
    backgroundColor: "{colors.soft-ivory}"
    textColor: "{colors.trust-navy}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "14px 16px"
    height: "48px"
  card:
    backgroundColor: "{colors.clear-white}"
    textColor: "{colors.trust-navy}"
    rounded: "{rounded.card}"
    padding: "24px"
---

# Design System: PHX Home Loan

## Overview

**Creative North Star: "The Trusted Local Advisor"**

PHX Home Loan should feel like a knowledgeable local advisor sitting beside a
customer: warm, personal, credible, clear, calm, and locally grounded. The
system earns trust through legible explanations, real people, useful evidence,
and confident next steps. It does not borrow authority from cold institutional
banking or luxury-mortgage gloss.

The canonical implementation and shared tokens are the design authority.
Prototypes in `PHXHomeLoan-web-prototype` express the intended composition and
editorial direction, with one correction: their exported copper accents should
usually be Advisor Teal. Legacy and template blocks are anti-reference; their
generic colors, typography, and component language must not be propagated into
new canonical work.

**Key Characteristics:**

- Warm editorial typography paired with plainspoken interface copy
- Advisor Teal actions against navy, paper, ivory, and white surfaces
- Restrained Mesa Copper details that add warmth without competing with teal
- Structured grids, generous reading space, and evidence-led compositions
- Soft, precise geometry with restrained ambient depth
- Full WCAG 2.2 AA behavior across states, themes, and viewport sizes

## Colors

The palette pairs trustworthy blue-green and navy with warm paper neutrals;
copper is a supporting detail, not an alternate primary.

### Primary

- **Advisor Teal** (`#1f6e8c`): Primary actions, links, focus rings, active
  states, and the clearest moments of directional emphasis.
- **Deep Advisor Teal** (`#18576f`): Hover and pressed emphasis for Advisor
  Teal.

### Secondary

- **Mesa Copper** (`#b4552d`): Small labels, selected warm details, and
  secondary emphasis, especially against dark surfaces. Do not use it for
  competing primary actions.

### Neutral

- **Midnight Navy** (`#0c1329`): Deep feature sections and cinematic media
  surfaces.
- **Trust Navy** (`#131c3b`): Primary headings and major dark surfaces.
- **Layered Navy** (`#1c2237`): Tonal depth inside dark-mode and dark feature
  compositions.
- **Warm Paper** (`#f7f4ee`): The warm neutral section surface.
- **Soft Ivory** (`#fdfcf9`): Inputs and delicate inset surfaces.
- **Paper Light** (`#fbf9f4`): Cards on white and subtle secondary surfaces.
- **Clear White** (`#ffffff`): Alternating light sections and cards on Warm
  Paper.
- **Body Ink** (`#3d4356`): Standard long-form and supporting copy.
- **Muted Ink** (`#5b6172`): Secondary information that must remain readable.
- **Border Sand** (`#e7e1d6`): Default borders and dividers.

### Supporting

- **Rating Gold** (`#e8a33d`): Rating stars only.
- **Label Peach** (`#feb77d`): Small labels on dark surfaces when copper would
  be too low-contrast.

### Named Rules

**The Teal Leads Rule.** Advisor Teal owns primary actions and active states.
Mesa Copper may warm a composition, but it must never create a second primary
action hierarchy.

**The Explicit Neutral Surface Rule.** Page Builder sections that expose the
Sanity background toggle use white by default and may be set to cream.
Reordering sections must not change their surfaces. Sections with designed
fixed backgrounds do not expose the toggle.

## Typography

**Display Font:** Source Serif 4 (with Georgia and serif fallbacks)  
**Body Font:** Archivo (with Helvetica, Arial, and sans-serif fallbacks)  
**Label/Mono Font:** Archivo for labels; SFMono-Regular for code-only contexts

**Character:** Source Serif 4 brings human editorial authority without feeling
ornamental. Archivo keeps explanations, navigation, forms, and actions direct
and contemporary.

### Hierarchy

- **Display** (600, `clamp(3rem, 5vw, 4.125rem)`, 1.05): Major persuasive
  statements and fixed feature sections.
- **Page title** (600, `2.25rem` to `3rem`, tight): Primary page orientation.
- **Headline** (600, `1.875rem` to `2.25rem`, 1.25): Section headings.
- **Title** (600, approximately `1.125rem` to `1.3125rem`, 1.25): Cards and
  compact content groups.
- **Lead** (400, `1.125rem`, approximately 1.78): Page introductions and
  important explanatory copy.
- **Body** (400, `1rem`, 1.75): Educational and supporting text, generally
  constrained to a readable measure near `48rem`.
- **Label** (600, `0.75rem`, `0.22em`, uppercase): Eyebrows and compact
  orientation cues.

### Named Rules

**The Editorial Clarity Rule.** Serif type establishes trust and hierarchy;
Archivo carries every task, explanation, label, and action. Do not use the
display face as decorative body copy.

## Layout

The default content wrapper is `80rem` (`max-w-7xl`) with responsive inline
padding. Reading-focused content narrows to `48rem` (`max-w-3xl`). Canonical
sections normally use `80px` vertical padding on smaller screens and `96px` on
larger screens; major fixed features may extend to approximately `110–120px`
when the composition needs more presence.

Grid is the default layout model. Two-column sections pair a person, image, map,
video, or proof artifact with explanatory content; card collections use
repeatable grids. Collapse to one column before content becomes cramped, often
near `900px` for designed sections. Preserve document order and reading logic
when columns collapse.

Page Builder sections that expose the background setting receive their surface
from that explicit Sanity value. The section must use the resolved `surface`
value and switch its card tone with the surface. Sections without the setting
own their intentional background.

## Elevation & Depth

The system uses a hybrid of tonal layering, borders, and restrained ambient
shadows. Most surfaces remain visually grounded. Shadows clarify hierarchy on
interactive cards, menus, important inset compositions, and emphasized actions;
they are not decoration applied to every container.

### Shadow Vocabulary

- **Ambient feature** (`0 24px 64px rgba(19, 28, 59, 0.08)`): Large inset
  advisor or contact compositions.
- **Interactive lift** (`0 22px 48px rgba(19, 28, 59, 0.14)`): Card hover,
  paired with no more than `4px` upward movement.
- **Menu layer** (`0 18px 44px rgba(19, 28, 59, 0.16)`): Dropdowns and
  temporary overlays.
- **Teal action** (`0 14px 40px -12px rgba(31, 110, 140, 0.72)`): Rare,
  emphasized primary actions on dark feature surfaces.

### Named Rules

**The Ambient, Not Floating Rule.** Depth should feel like soft environmental
light. Use tonal separation and borders first; reserve stronger shadows for
state, overlap, or high-value emphasis.

## Shapes

Controls use precise softened corners: `8–10px` for buttons and fields.
Standard content cards use approximately `16px`; feature containers may use
`24px`. Fully rounded pills are reserved for compact labels, categories, and
true capsule controls. Circular and arched geometry may frame portraits or
other signature imagery, but should not spread to unrelated containers.

Borders use the sand neutral family and remain visible enough to define a
surface without making the page feel boxed in. Image clipping follows the
container: small images use the base radius, card media is clipped by the card,
and immersive media may use larger feature geometry.

### Named Rules

**The Softness Has Scale Rule.** Radius grows with the physical and visual size
of the object. Do not apply one exaggerated radius to controls, cards, sections,
and media indiscriminately.

## Components

Components should feel refined and reassuring, with tactile confidence. Shared
primitives provide the baseline; canonical PHX compositions may increase scale
without changing the color, type, focus, or state logic.

### Buttons

- **Shape:** `8–10px` corners; compact enough to feel precise.
- **Primary:** Advisor Teal with white text, semibold Archivo, and a minimum
  practical target height of `40px`; important actions commonly use `44–56px`.
- **Hover / Focus:** Deep Advisor Teal or a controlled brightness increase;
  visible `3px` teal focus ring with sufficient offset and contrast.
- **Outline:** Light surface, Trust Navy text, sand border; hover shifts toward
  the secondary paper surface and a subtle teal border.
- **Ghost / Link:** Use only when hierarchy clearly calls for low emphasis.

### Labels and Chips

- **Style:** Small semibold Archivo, uppercase, with deliberate tracking.
- **Color:** Advisor Teal on light surfaces; Mesa Copper or Label Peach may be
  used sparingly on dark surfaces.
- **Shape:** Plain text by default; pill treatment only when the label is a
  category, filter, status, or compact overlay.

### Cards / Containers

- **Corner Style:** `16px` for standard editorial cards; up to `24px` for major
  feature containers.
- **Background:** White cards on Warm Paper; Paper Light cards on white.
- **Shadow Strategy:** Border and tonal contrast at rest; ambient lift for
  interactive or emphasized cards.
- **Border:** `1px` Border Sand or a theme-equivalent semantic border.
- **Internal Padding:** Usually `24–48px`, scaled to composition density.

### Inputs / Fields

- **Style:** Soft Ivory background, `1–1.5px` Input Sand border, `9px` corners,
  and comfortable `14px 16px` padding.
- **Focus:** Advisor Teal border plus a visible translucent `3px` ring.
- **Error / Disabled:** Error color and ring remain explicit; disabled fields
  reduce opacity without removing labels or context.

### Navigation

The main navigation is an `86px` sticky, lightly translucent surface with a
bottom border and backdrop blur. Links use medium Archivo at approximately
`14.5px`; hover and keyboard focus move toward Advisor Teal. Dropdowns use
layered white or navy surfaces, `12px` corners, and the menu-layer shadow.
Mobile navigation preserves the same hierarchy and exposes a clear close path.

### Page Builder Surfaces

Sections with the Sanity background toggle use white unless it is enabled, then
adjust card colors for the cream surface. Sections without the toggle may own a
specific visual field such as navy, media, reviews, or a hero composition. This
behavior is part of the design system, not incidental page styling.

## Do's and Don'ts

### Do:

- **Do** lead with Advisor Teal for actions, active states, links, and focus.
- **Do** use Mesa Copper as restrained warmth in labels and secondary details.
- **Do** honor each neutral section's explicit white or cream background
  setting.
- **Do** use Source Serif 4 for editorial authority and Archivo for clarity and
  task completion.
- **Do** build trust with real people, evidence, education, and verified claims.
- **Do** meet WCAG 2.2 AA, including keyboard, focus, contrast, zoom, reduced
  motion, media, and responsive behavior.

### Don't:

- **Don't** copy the prototypes' exported copper default into primary actions;
  translate those accents to Advisor Teal unless the detail is intentionally
  secondary.
- **Don't** propagate generic template colors, typography, or component
  treatments into canonical sections.
- **Don't** treat migrated legacy sections as design-system authority.
- **Don't** make the interface feel like generic SaaS, cold institutional
  banking, luxury-mortgage advertising, or Jimmy's national veteran-first
  brand.
- **Don't** use strong shadows, pills, oversized radii, or motion as universal
  decoration.
- **Don't** add the neutral background toggle to a section whose designed
  background should not be editor-controlled.

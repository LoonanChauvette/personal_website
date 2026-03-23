# Design System Strategy: The Curated Archive

## 1. Overview & Creative North Star

The Creative North Star for this design system is **"The Digital Monograph."**

In an era of over-stimulated digital interfaces, this system draws inspiration from high-end academic publishing and archival journals. We are moving beyond "minimalism" into "intentionality." The goal is to treat the screen like a premium tactile surface—think 120gsm uncoated paper.

We break the "standard template" look through **Rigid Asymmetry**. While most sites center everything, we will use the Spacing Scale to create wide, intentional gutters and staggered content blocks. This creates a rhythmic "editorial" flow where the white space is as much a content element as the text itself.

## 2. Colors & Surface Logic

The palette is rooted in a high-contrast monochromatic base, softened by a warm, paper-like background (`#fcf9f8`) to prevent eye strain and evoke a sense of history.

* **The "No-Line" Rule:** Direct structural sectioning using `1px` borders is strictly prohibited. Use tonal shifts between `surface` (#fcf9f8) and `surface-container-low` (#f6f3f2) to define regions.

* **Surface Hierarchy:** To create depth without shadows, use **Nesting**. A "card" or "inset" should be `surface-container-lowest` (#ffffff) sitting atop a `surface-container` (#f0eded) background. This creates a natural, "stacked paper" effect.

* **The Blue Thread:** The `primary` blue (#115cb9) is a precision tool. It is reserved exclusively for interactive elements (links, active states) and never for decorative background fills. Use `primary-container` (#d7e2ff) at 10-15% opacity for subtle text highlighting or "mark-up" effects.

## 3. Typography

The typographic soul of this system lies in the tension between the intellectual `notoSerif` and the utilitarian `inter`.

* **Display & Headline (notoSerif):** These are your "Statement" tiers. Use `display-lg` (3.5rem) with generous bottom margins (`spacing-12`) to anchor pages. The serif conveys authority and the "Academic" persona.

* **Body & Title (inter):** Body text must remain at `body-lg` (1rem) for maximum legibility. Use a slightly tighter tracking (-0.01em) to give the sans-serif a "typeset" look.

* **Labels (inter):** Used for metadata, dates, or citations. These should often be in `label-md` or `label-sm`, set in All Caps with +0.05em letter spacing to differentiate from body prose.

## 4. Elevation & Depth

In a minimalist academic environment, traditional drop shadows feel "app-like" and cheap. We use **Tonal Layering**.

* **The Layering Principle:**

* **Level 0 (Background):** `surface` (#fcf9f8).

* **Level 1 (Content Blocks):** `surface-container-low` (#f6f3f2).

* **Level 2 (Active/Floating):** `surface-container-lowest` (#ffffff).

* **Ambient Shadows:** If a floating element (like a citation popover) requires a shadow, use a "Whisper Shadow": `0px 20px 40px rgba(50, 50, 51, 0.04)`.

* **The "Ghost Border":** For buttons or input fields, use `outline-variant` (#b2b2b1) at 30% opacity. This creates a hairline definition that disappears into the background, maintaining the "No-Line" aesthetic.

## 5. Components

### Buttons

* **Primary:** No background fill. Use a `1px` Ghost Border (`outline-variant` @ 40%) and `notoSerif` text in `primary` blue. Upon hover, transition to a subtle `primary-container` background.

* **Tertiary/Text:** `inter` Medium, all caps, with a `primary` underline that is `1px` thick and offset by `2px`.

### Cards & Research Items

* **Style:** Forbid the use of boxes. A "card" is defined by a vertical `spacing-8` gap and a `surface-container-low` background that bleeds to the edge of the container.

* **Dividers:** Never use horizontal rules (`

`). Use a`spacing-10` gap or a change in typography (from `body` to `label-sm` metadata) to signal a break.

### Input Fields

* **Form:** A single bottom border using `outline-variant` (#b2b2b1). The label should sit above in `label-sm` and `on-surface-variant` color.

* **Focus State:** The bottom border transforms to `primary` blue (#115cb9) with a `2px` weight.

### Navigation

* **Style:** Use a "Sticky Header" with a `backdrop-blur` of `12px` and a semi-transparent `surface` background (Alpha 80%). This allows the content to ghost through as the user scrolls, emphasizing the digital-physical hybridity.

## 6. Do's and Don'ts

### Do

* **Embrace the "Asymmetric Gutter":** Push your main content column 1/3rd to the right, leaving a wide left gutter for `label-md` dates or marginalia.

* **Use Hard Edges:** The `roundedness` scale is `0px`. Everything is sharp, architectural, and precise.

* **Prioritize Leading:** For `body-lg`, use a line-height of at least `1.6` to ensure the academic text "breathes."

### Don't

* **Don't use "Pure Black":** Use `on-surface` (#323233) for text. Pure #000000 is too aggressive for the warm `surface` background.

* **Don't use Gradients:** This is a flat, "ink-on-paper" system.

* **Don't use Icons for Navigation:** Rely on clear, well-set typography. Icons should only be used for functional utility (e.g., a "Download PDF" arrow).

## 7. Signature Interaction: The "Ink Bleed"

When hovering over a link or a primary action, do not use a standard "color change." Instead, use a subtle background-color transition to `primary-container` (#d7e2ff) that expands slightly from the center—mimicking a drop of ink hitting a damp page. This provides a tactile, premium response to user input.

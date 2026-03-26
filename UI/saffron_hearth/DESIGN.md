# Design System Strategy: The Culinary Letter

## 1. Overview & Creative North Star
**Creative North Star: "The Modern Heirloom"**

This design system rejects the sterile, transactional nature of typical food delivery apps. Instead, it treats the digital interface as a "culinary letter"—a personal, warm invitation into a Sri Lankan home. We achieve this by blending **Handcrafted Editorial** (high-contrast serif typography and organic shapes) with **Modern Tactility** (soft layering and glassmorphism).

To break the "template" look, we utilize **Intentional Asymmetry**. Hero images should bleed off the edge of the viewport, and floating "ingredients" (organic shapes) should overlap container boundaries. We avoid the rigid grid in favor of a fluid, rhythmic layout that feels like a beautifully set table rather than a spreadsheet of menu items.

---

## 2. Colors & Surface Philosophy

The palette is rooted in the earth: the deep glow of saffron, the softness of cream, and the grounding depth of forest green.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are strictly prohibited for sectioning or containment. 
Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background creates a natural, soft edge. We define space through mass and tone, not lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like fine linen stacked on a wooden table. 
- **Base:** `surface` (#fcf9f8)
- **Primary Cards:** `surface-container-lowest` (#ffffff) to provide "pop" against the warm base.
- **Inner Containers:** Use `surface-container` (#f0eded) to create nested depth for secondary information like delivery details or ingredient lists.

### The "Glass & Soul" Rule
To elevate the experience beyond flat design:
- **Glassmorphism:** Use semi-transparent `surface-container-lowest` with a `backdrop-blur` of 20px-40px for floating navigation bars or "Live Timer" overlays.
- **Signature Gradients:** For primary CTAs and Hero sections, use a subtle linear gradient from `primary` (#9a4601) to `primary_container` (#e07b39). This adds a "simmering" visual depth that flat hex codes cannot achieve.

---

## 3. Typography: The Editorial Voice

We utilize a "High-Low" typographic mix to balance friendly utility with storytelling warmth.

*   **The Utility (Plus Jakarta Sans):** Used for UI elements, labels, and navigation. Its rounded terminals mirror the `1rem+` corner radius of our components, ensuring the interface feels approachable.
*   **The Soul (Noto Serif):** Used for storytelling, meal descriptions, and titles. This provides the "letter from a friend" feel, emphasizing the handcrafted nature of the food.

| Role | Font Family | Size | Intent |
| :--- | :--- | :--- | :--- |
| **Display-LG** | Plus Jakarta Sans | 3.5rem | Bold, welcoming brand moments. |
| **Headline-MD** | Plus Jakarta Sans | 1.75rem | Clear, modern section headers. |
| **Title-LG** | Noto Serif | 1.375rem | Dish names; the "Editorial" focus. |
| **Body-LG** | Noto Serif | 1.0rem | Long-form story or meal provenance. |
| **Label-MD** | Plus Jakarta Sans | 0.75rem | Functional micro-copy & buttons. |

---

## 4. Elevation & Depth: Tonal Layering

We do not use structural lines to separate content. Instead, we use **Tonal Stacking**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift that mimics paper on a desk.
*   **Ambient Shadows:** For floating elements (like the Cart or Live Timer), use a "Sun-Drenched Shadow":
    *   *Blur:* 40px - 60px.
    *   *Opacity:* 5% - 8%.
    *   *Color:* Use a tinted version of `on-surface` (#1c1b1b) rather than pure black to keep the warmth.
*   **The "Ghost Border" Fallback:** If a container lacks contrast (e.g., image on a similar background), use a "Ghost Border": `outline-variant` (#dcc1b4) at **15% opacity**. Never 100%.

---

## 5. Components

### The Live Countdown Timer (Signature Component)
Unlike a standard digital clock, this should feel like a "pulsing" heart. 
- **Style:** A glassmorphic capsule (`surface-container-lowest` at 80% opacity, 40px blur).
- **Typography:** `headline-sm` in `primary`.
- **Motion:** A subtle "breathing" scale animation (1.0 to 1.02) to signal active preparation.

### Buttons & Inputs
- **Primary Button:** `primary` background with `on-primary` text. Use `rounded-lg` (2rem) for a pill-shaped, organic feel. 
- **Input Fields:** No borders. Use `surface-container-high` as the background. On focus, transition the background to `surface-container-lowest` and apply a "Ghost Border" of `primary` at 20% opacity.
- **Cards:** Forbid divider lines. Use `spacing-8` (2.75rem) to separate the meal image from the description.

### Chips & Tags
- **Selection Chips:** Use `secondary-container` (#e8e2d8) for unselected states. When selected, use `tertiary` (#2c694e) to evoke the freshness of Sri Lankan herbs.

---

## 6. Do’s and Don’ts

### Do:
- **Do** use organic, hand-drawn SVG blobs as background "z-index: 0" elements behind food photography.
- **Do** embrace generous whitespace (using `spacing-12` or `spacing-16`) to make the UI feel premium and unhurried.
- **Do** use high-quality, top-down photography with natural lighting.

### Don’t:
- **Don’t** use "Card Dividers" or horizontal rules. Let the `surface` color shifts do the work.
- **Don’t** use sharp corners. Everything must have a minimum of `DEFAULT` (1rem) roundedness to maintain the "Handcrafted Warmth."
- **Don’t** use pure black (#000000). Always use `on-surface` (#1c1b1b) to keep the "near-black" editorial tone soft.
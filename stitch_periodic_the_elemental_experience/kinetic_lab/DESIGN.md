---
name: Kinetic Lab
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#0058bc'
  on-secondary: '#ffffff'
  secondary-container: '#0070eb'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a41'
  on-secondary-fixed-variant: '#004493'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '600'
    lineHeight: 72px
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style
The design system is a synthesis of "Museum Grade" clarity and futuristic precision. It targets curious minds, researchers, and students who value a clutter-free, high-fidelity learning environment. The personality is intellectual, pristine, and sophisticated, avoiding the typical neon-heavy tropes of "futuristic" design in favor of a laboratory-clean aesthetic.

The style leverages **Physical Minimalism**—a blend of Apple’s structural discipline, Nothing’s technical transparency, and the interactive elegance of a modern science exhibition. The UI feels like a high-end glass instrument: light, breathable, and hyper-functional. We prioritize high whitespace to let complex data (like molecular structures) breathe, using thin structural lines to define space rather than heavy fills.

## Colors
The palette is rooted in a monochromatic "Gallery White" foundation to maximize legibility and focus. 

- **Primary (#121212):** Used for high-contrast typography and structural anchors.
- **Secondary (#007AFF):** "Science Blue" is used sparingly for interactive cues, progress indicators, and active states. It represents the spark of discovery.
- **Surface Tiers:** White (#FFFFFF) is the base, with Off-White (#FAFAFA) used for secondary containers and Light Gray (#F0F0F0) for subtle borders and background depth.
- **Accent Logic:** Avoid any vibrant gradients. Color is functional, not decorative. Use the Science Blue only when user attention is required.

## Typography
This design system utilizes **Inter** for its neutral, systematic clarity across all primary interfaces. To lean into the "scientific" nature of the product, **JetBrains Mono** is introduced for technical data, atomic numbers, and secondary labels to provide a precise, data-driven feel.

Large display headings use tight letter spacing and medium weights to create a "premium tech" look. Body text is prioritized for long-form readability with generous line heights. All labels for scientific units or metadata should use the Monospace variant to differentiate data from narrative.

## Layout & Spacing
The layout follows a **Strict 8px Grid** but maintains an airy, "No-Grid" appearance through the use of expansive margins.

- **Desktop:** A 12-column fluid grid with 64px outer margins. Content is often centered in a "Stage" layout to mimic museum displays.
- **Mobile:** A 4-column grid with 20px margins.
- **Rhythm:** Spacing between sections should be aggressive (e.g., 80px, 120px) to maintain the premium, high-whitespace feel.
- **Micro-spacing:** Use 8px and 16px for internal component padding to maintain a compact, technical feel within the broader open layout.

## Elevation & Depth
Depth is achieved through **Optical Layering** rather than traditional drop shadows.

1.  **Backdrop Blurs:** Use high-diffusion blurs (20px - 40px) for floating navigation bars and modals, creating a "Frosted Glass" effect.
2.  **Thin Strokes:** Instead of shadows, use 0.5px to 1px borders in `#F0F0F0` or `#121212` (at 5-10% opacity) to define object boundaries.
3.  **Tonal Stacking:** Objects closer to the user are pure white (#FFFFFF), while background canvases are off-white (#FAFAFA). 
4.  **Particle Depth:** A subtle, low-opacity background layer of moving "atomic particles" provides a sense of infinite 3D space without cluttering the UI.

## Shapes
The shape language is "Organic Geometric." While the structural grid is rigid, the corners are generous and soft to feel approachable and modern.

- **Standard Elements:** 16px (rounded-lg) for buttons and input fields.
- **Feature Cards:** 24px (rounded-xl) for large periodic cells or content containers.
- **Interactive Cells:** Periodic table elements should use a consistent 12px radius, ensuring they look like tactile "tiles."

## Components
- **Interactive Periodic Cells:** High-density tiles with a 1px internal border. On hover, they should scale slightly (1.05x) using a physics-based spring (stiffness 300, damping 30).
- **Morphing Cards:** When a cell is clicked, it should morph into a full-screen or expanded card detail using shared element transitions.
- **Buttons:** Primary buttons are solid Charcoal (#121212) with white text. Secondary buttons are Ghost-style with a 1px light-gray border. No heavy gradients or shadows.
- **Inputs:** Minimalist bottom-border only or very light #FAFAFA fills. Focus states use a clean 1px Science Blue (#007AFF) outline.
- **Data Tables:** Borderless, using only subtle horizontal dividers and JetBrains Mono for numeric values.
- **Motion:** All interactions must feel "instant but smooth." Use `cubic-bezier(0.2, 0.8, 0.2, 1)` for almost all transitions to mimic the 120fps fluid feel of high-end mobile OS interfaces.
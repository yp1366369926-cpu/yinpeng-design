# Connected homepage QA — 2026-10-09

final result: passed

Scope: the requested continuation of the homepage, including the two glass endpoints, public work placeholders, scroll paper behavior, pointer following, particle transition, four text chapters, and contact footer. This is a local review build, not certification of a pixel-identical full site. Project detail routes and personal-content replacement are outside this iteration.

## Evidence and comparison
- Source truth: live `https://haoqi.design/`; user recording `录屏2026-10-09 18.35.32.mov`, decoded to `work/continuation-contact.jpg`; source captures `work/source-works-desktop.jpg`, `work/source-tunnel-desktop.jpg`, `work/source-contact.jpg`, and `work/source-contact-mobile.jpg`.
- Rendered implementation: `http://localhost:4173/`; `review/works-desktop.jpg`, `review/tunnel-desktop.jpg`, `review/contact-desktop.jpg`, `review/works-mobile.jpg`, `review/contact-mobile.jpg`.
- Desktop CSS viewport and source/implementation pixel dimensions: 1280 × 720. Mobile: 390 × 844. Same-size images, no density resampling before comparison. Comparisons are combined images rather than separate views.
- Full-view side-by-side comparisons: `review/comparison-works.jpg`, `review/comparison-tunnel.jpg`, `review/comparison-contact.jpg`, `review/comparison-contact-mobile.jpg`.
- Focused image/label/typography comparisons: `review/comparison-works-detail.jpg` and `review/comparison-contact-detail.jpg`. Full-size captures retain legibility.
- State: light theme, settled navigation positions, static work cover, primary particle title, settled footer. Stickers, glass highlights, and moving pointer coordinates are time-dependent and were not treated as pixel errors. Source and local timestamps differ.

## Findings and iteration history
1. [P2, fixed] Work covers received glass flare highlights. Gated the flare by glass-endpoint visibility. Recaptured the work area with clear covers and original pixel hover reveal.
2. [P2, fixed] Work entry lacked its eight pixels of card padding, shifting the first cover and subsequent row. Restored padding and responsive row spacing; `comparison-works-detail.jpg` verifies the first cover bounds and labels.
3. [P2, fixed] The initial particle palette used substituted cyan/purple values and compressed text stages. Restored source blue/cyan shader colors, source scroll-time expression, eight-viewport section, and all four text chapters. `comparison-tunnel.jpg` shows the corrected field and primary title.
4. [P2, fixed] Footer title aligned incorrectly on desktop and mobile, and the mobile footer control was undersized. Corrected grid proportions, right alignment, responsive type size, link size, and progress control. Mobile control now returns to the hero.
5. [P2, fixed] Footer glass gradient was reversed and the desktop model was too near the camera. Applied the source footer tint order independently of the hero and restored desktop depth. Post-fix captures are `contact-desktop.jpg` and `contact-mobile.jpg`.

No remaining actionable P0/P1/P2 findings in this iteration's review scope.

## Required fidelity surfaces
- Fonts/typography: locally stored original TikTok Sans, Geist Mono, and Departure Mono; original heading content and display-width setting. Footer wrapping and first-line separation match desktop and mobile composition. Slight optical width differences remain P3.
- Layout/rhythm: original 12-column staggered work arrangement, desktop 56px/mobile 16px page inset, first-cover padding, eight-viewport narrative, fixed controls and responsive paired cards. No horizontal overflow in tested viewports.
- Colors/tokens: warm paper work background, black particle background with original blue/cyan radial shader and hue variation, blue glass with the footer's reversed tint order, lime coding labels and pointer indicator.
- Assets/image quality: original local portrait, signature, covers, hover textures, cursor model, contact model, sticker assets and fonts. Hoverable textures use the source linear-filter behavior. No generated substitutes or hotlinked image assets.
- Copy/content: source public author introduction, all ten currently visible works, four narrative chapters and contact addresses retained as placeholders. Protected content remains concealed. Local cover dialog is intentionally a review placeholder rather than a cloned detail route.

## Interaction and runtime verification
- Desktop WORK and CONTACT navigation; brand returns to top.
- Mobile menu opens/closes and navigates to work/contact; mobile progress control returns to hero.
- Work hover/focus changes cover by pixel expansion; cover preview opens and closes, restoring focus and scroll position.
- Real scroll input through gallery, particle stages and footer; reverse scroll returns to the prior title stage. Velocity-driven curl uses the captured original shader.
- Pointer-driven glass refraction, following arrow and lime trail; arrow enlarges and reveals the same radial field used by the tunnel. Footer glass rotates into view and sticker bursts appear.
- Reduced-motion branch disables fluid, drifting stickers and letter animations; coarse-pointer branch omits the desktop trail.
- Browser console: no errors in final desktop/mobile runs. Production build succeeded. Ten Node checks passed, including scroll boundaries, reverse scrubbing, responsive geometry bounds, fluid inactivity/mobile preferences and static packaging.

## Follow-up polish (P3)
- Match the original continuous-scroll damping and arrow spin/easing more closely after user motion review.
- Refine tiny display-width, grid crosshair and optical alignment differences.
- Random sticker positions and elapsed-time highlights are intentionally not frame-identical between sessions.

## Implementation checklist
- [x] Capture source motion and visible content.
- [x] Connect hero, paper gallery, particle narrative and glass footer.
- [x] Correct P2 findings and recapture desktop/mobile evidence.
- [x] Run production build, ten checks, and browser console verification.
- [x] Keep local preview; retain placeholder content for later replacement.

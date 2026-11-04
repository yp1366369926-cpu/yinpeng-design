# Interactive Hello — first screen

A local, independent React + Three.js portfolio hero. The first screen includes the original reference hello geometry, cursor geometry, sticker textures, glass refraction, lens flare, animated background, pointer parallax, click-triggered stickers and arrow spin, theme controls, and opt-in audio.

## Run

```sh
pnpm install
pnpm dev -- --host 0.0.0.0 --port 4173 --strictPort
```

```sh
pnpm build
pnpm test:sites
```

Open http://localhost:4173/.

## Next steps

Personal content is held in the `profile` object in `src/App.jsx`. The Three.js scene is isolated in `src/hero-scene.js`, so the hero can be mounted alongside later sections. The current hero is intentionally one viewport tall. Work/contact navigation will be connected when those sections are built. Weather is not simulated. There is no GitHub upload or public deployment in this version.

Pointer movement changes the camera and light, and fast mouse strokes produce local fluid distortion with spectral folds. This fluid layer is disabled on mobile and for reduced-motion preferences. Click the background or the bottom coordinate display to release stickers and spin the arrow. Use the upper-right theme and sound controls; on mobile they are inside the menu. Reduced-motion preferences disable automatic model rotation, floating and falling stickers.

See ASSET-SOURCES.md before distributing reference assets.

## Connected homepage
The preview now includes the hero, author introduction, ten visible works, an eight-viewport particle section with four text chapters, and the glass contact footer. Scroll in either direction to scrub transitions; hover work covers for the original pixel reveal. Work buttons open a local cover preview; project detail pages are a later step. On phones the bottom-right control returns to the top. Sound remains opt-in.

Replace the profile in `src/App.jsx` and the entries in `src/portfolio-data.js` when the owner's material is available. The source author and works are still review placeholders. No GitHub upload or public deployment has been performed.

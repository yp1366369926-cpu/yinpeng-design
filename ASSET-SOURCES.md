# Reference assets

Reference: https://haoqi.design/ (captured 2026-10-09)

This local review prototype uses public reference assets downloaded from the website: hello.gltf, cursor.glb, twelve sticker textures, three typefaces, icon.svg, rotating globe SVG paths, and bgm.mp3. The glass and six background and two lens-flare GLSL shader assets were extracted from the publicly loaded client bundle to preserve the reference material treatment. All runtime assets are served locally. The React application, rendering orchestration, responsive layout, interaction lifecycle, and controls are authored for this prototype.

These reference materials remain the property of their respective owners. Review licensing/permission before distributing the reference assets. Personal information is temporary reference content and should be replaced before publication.

Scope: independent first-screen module only. No project pages or GitHub publishing. Work/contact links are omitted until those sections exist. Live weather is omitted until a weather source is selected; time uses Asia/Shanghai.

Fluid update: eight GLSL fluid-simulation/display shader assets were extracted from the same reference bundle. The opaque-section pixel-cursor overlay is removed from the display shader because this increment only contains the translucent hero. The GPU simulation orchestration and pointer tracking are authored locally, preserving the original parameters: 160-pixel base simulation grid, four pressure iterations, 3000 force, 0.003 radius, 3 dissipation, 600 ms activity window.

## Homepage continuation — 2026-10-09
The public author portrait (`/img/m3.png`), ten visible work covers and their hover images (`/work/*`), original signature SVG, and footer `model/cnt.gltf` are stored under `public/assets/`. The protected eleventh work was not added or unlocked. The existing visible personal information and public works remain replaceable review content.

`paper.vert`, `paper.frag`, `arrow-transition.vert`, and `arrow-transition.frag` preserve the observed client-side shader math from the public source bundle. `tunnel.frag` uses that same radial field with a full-screen entry point. Local authored code provides DOM rectangle tracking, scroll scrubbing, lifecycle cleanup, navigation, responsive sizing, text staging, and the pointer trail. No source media is hotlinked.

# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## 首屏视觉约束（2026-11-03）

用户要求参照提供的录屏继续优化首屏光影、折射与拟液态效果；其他内容保持不变。调整应限于首屏光学材质与液态反馈，不改变布局、文案、模型轮廓、贴纸行为及后续章节。

用户后续要求将同样的光影、折射和拟液态优化应用到底部玻璃模型；保留底部布局、文案及滚动入场动画。首屏与底部均可使用细化后的光学效果，中间章节保持原样。

用户要求打开网站时显示进度条，填满后遮罩从中央向左右展开，露出首屏；参考 2026-11-03 18.56.42 录屏，使用暖白底与细黑进度条，资源就绪后才允许完成。

加载界面后续改用 React Bits 官方 GradientASCII JS-CSS registry 原始源码；使用用户指定的蓝白四色、horizon、字符集 ` =+xX0S8#@`、cellSize 18、density 0.8。保留资源进度与满载后中央向左右展开的逻辑。

用户后续要求开屏的进度显现与入场过渡均从下向上，取消左右展开；底部静态网格替换为附件中的 React Bits CursorGrid，使用 60px 网格、青色区域高亮、鼠标聚光和点击扩散。其他布局及已有玻璃光效保持。

用户反馈开屏与网站衔接生硬：向上退场叠加遮罩透明度渐隐、ASCII 模糊淡出和首屏从模糊到清晰的过渡，最后再解除加载层。

最新要求：完整移除 CursorGrid 组件及其相关样式和滚动绑定，恢复原有静态网格；底部联系邮箱为 `17600043819@163.com`，删除 TWITTER/X 文案及链接；FIGMA 指向用户提供的个人作品文件 `1lVI4MkkqwQLs94oa63V8n`。

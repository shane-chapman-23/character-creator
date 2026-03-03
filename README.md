# Pixel Character Creator

Live Demo: https://character-creator-orpin.vercel.app/

A modular pixel-art character creator built with React, TypeScript, Vite, and Tailwind CSS.

The app composes layered sprites on canvas, applies runtime palette tinting, and keeps selections stable with ID-based config persistence, ensuring saved characters remain stable even when asset sets change.

## Preview

![Character Creator Demo](docs/demo.gif)

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - type-check and build for production
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint
- `npm run test` - run Vitest
- `npm run test:watch` - run tests in watch mode
- `npm run test:coverage` - run tests with coverage

## Current Features

- Layered sprite rendering (`bg` + `outline`) for body, head, and hair
- Single-layer overlays for eyes and mouth
- Runtime palette swaps using canvas compositing (`source-in`)
- Selector tabs for body, face, and clothing options
- Animation mode toggle (`idle` / `run`)
- Randomize action with precomputed next random config
- Local persistence (`character_config_v1`) with clamping when assets change
- Image caching and warm preloading for likely next selections
- Dev-time diagnostics for invalid/missing/duplicate layered assets

## Rendering Pipeline

1. `buildCharacterLayers` maps `CharacterConfig` to ordered render groups (`body` and `head`).
2. `useCharacterPreviewRenderer` runs a requestAnimationFrame loop.
3. Body frames are selected from `BODY_IDLE` or `BODY_RUN` via `getBodyFrameIndex`.
4. Layered parts draw as: `bg` mask -> tint fill (`source-in`) -> `outline`.
5. Assets are loaded through shared cache helpers (`getOrCreateImage`, `preloadImages`).

Current draw order:

- Body: legs -> bottom -> top -> arms
- Head: head -> eyes -> mouth -> hair

Notes:

- Body and head are rendered on separate canvases so head bob/tilt transforms do not affect body layers.
- Run mode uses a smoothed 3-frame pattern (`0-1-2-1`) when applicable.

## Preloading Strategy

The preview preloads URLs for:

- current config
- one-step adjacent configs (prev/next by part and colour)
- precomputed next random config

This is built in `src/render/warmBubble.ts` and consumed by `CharacterPreviewCanvas`.

Important behavior:

- dedupes URLs before preloading
- preloads both idle and run assets
- loading overlay clears when required images are settled (loaded or failed)

## Asset Pipeline

Assets are discovered with Vite `import.meta.glob` and converted into stable options at module initialization.

Supported asset types:

1. Layered assets (`head`, `hair`, `body`) as filename pairs:
   - `*_bg.png`
   - `*_outline.png`
2. Single-layer assets (`eyes`, `mouth`) as standalone `.png` files

Layered key examples:

- `hair_3_0_outline.png` + `hair_3_0_bg.png` -> `hair_3_0`
- `body_idle_arms_1_outline.png` + `body_idle_arms_1_bg.png` -> `body_idle_arms_1`

Only valid pairs are exposed to the app.

## Asset Naming Rules

Layered files must match:

`<category>_<variant>_<frame>_(outline|bg).png`

- `category`: `[a-z0-9]+` (no underscores)
- `variant`: `[a-z0-9_]+` (underscores allowed)
- `frame`: `\d+`

Single-layer IDs come from filename without extension:

- `eyes0.png` -> `eyes0`
- `mouth2.png` -> `mouth2`

## State Model

State is reducer-driven and provided via `CharacterConfigProvider`.

Config shape:

- `parts`: IDs for `hair`, `eyes`, `mouth`
- `colours`: indexes for `skin`, `hair`, `top`, `bottom`

On startup and on config application, values are clamped to currently available options so stale persisted values cannot break rendering.

## Project Structure

- `src/components` - preview canvas, selectors, animation controls, scale wrapper
- `src/render` - layer building, animation timing, canvas renderers, image cache, preload logic
- `src/state` - config types, reducer, provider, selector helpers, available IDs/palettes
- `src/data` - asset discovery, pair validation, diagnostics, palette data

## Testing

Vitest coverage includes:

- layered asset pairing and diagnostics
- single-layer asset ID mapping
- reducer and config clamping behavior
- selector utility behavior
- canvas renderer and image-cache behavior

# Pixel Character Creator

A modular pixel-art character creator built with React, TypeScript, and Vite.

The app composes layered sprites on an HTML canvas, tints mask layers at runtime, and keeps selections stable via ID-based config persistence.

## Quick Start

```bash
npm install
npm run dev
```

Scripts:

- `npm run dev` - start local dev server
- `npm run build` - type-check and build for production
- `npm run preview` - serve the production build locally
- `npm run test` - run Vitest
- `npm run test:watch` - run tests in watch mode
- `npm run test:coverage` - run tests with coverage
- `npm run lint` - run ESLint

## Current Features

- Layered character rendering (`bg` + `outline`) for body/head/hair
- Single-layer overlays for eyes and mouth
- Runtime palette swaps using canvas compositing (`source-in`)
- Configurable parts and colours with prev/next controls
- `Randomize` and `Reset` actions
- Local persistence (`character_config_v1`) with safe clamping when assets change
- Image caching and warm preloading for likely next selections
- Dev-only diagnostics for missing pairs, duplicates, and unrecognized names

## Rendering Pipeline

1. `buildCharacterLayers` maps the current `CharacterConfig` to ordered render layers.
2. `renderCharacterToCanvas` draws each layer into a 256x256 canvas.
3. Layered parts are tinted by drawing `bg`, filling color with `source-in`, then drawing `outline`.
4. Images are fetched through a shared cache (`getOrCreateImage`) to avoid redundant loads.

Current draw order:

1. Legs
2. Bottom
3. Top
4. Arms
5. Head
6. Eyes
7. Mouth
8. Hair

## Preloading Strategy

The preview preloads:

- the current config
- all one-step adjacent configs (prev/next for each part and colour)
- the precomputed next random config

This is built in `src/render/warmBubble.ts` and consumed by `CharacterPreviewCanvas`.

Notes on loading behavior:

- duplicate URLs are deduped before preloading
- images are treated as settled when `img.complete` is true (loaded or failed)
- the loading overlay clears when required images are settled, preventing stuck UI on broken assets

## Asset Pipeline

Assets are eagerly discovered with Vite `import.meta.glob` and converted into stable options at module initialization.

Supported asset types:

1. Layered assets (`head`, `hair`, `body`) as filename pairs:
   - `*_bg.png`
   - `*_outline.png`
2. Single-layer assets (`eyes`, `mouth`) as standalone `.png` files

Layered keys are filename-derived (examples):

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
- `colours`: indices for `skin`, `hair`, `top`, `bottom`

On startup and on config application, values are clamped to currently available options so stale persisted values cannot break rendering.

## Project Structure

- `src/components` - preview canvas, selectors, scale wrapper
- `src/render` - layer building, canvas renderer, image cache, warm preload logic
- `src/state` - config types, reducer, provider, selector helpers, available IDs/palettes
- `src/data` - asset discovery, pairing, diagnostics, palette data

## Testing

Vitest coverage includes:

- layered asset pairing and diagnostics
- single-layer asset ID mapping
- reducer and config clamping behavior
- selector utility behavior
- canvas/image-cache behavior

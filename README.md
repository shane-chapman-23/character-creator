# Pixel Character Creator

Live demo: https://character-creator-orpin.vercel.app/

A React + TypeScript pixel character creator with layered canvas rendering, runtime tinting, reducer-driven config state, and a run-only parallax background system.

## Preview

![Character Creator Demo](docs/demo.gif)

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Vitest + Testing Library

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - type-check and production build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint
- `npm run test` - run Vitest
- `npm run test:watch` - run tests in watch mode
- `npm run test:coverage` - run tests with coverage

## Features

- Layered character rendering (`bg` + `outline`) for body/head/hair
- Single-layer overlays for eyes and mouth
- Palette tinting via canvas compositing (`source-in`)
- Idle/run animation toggle
- Randomize with precomputed next random config
- Local persistence (`character_config_v1`) with safe clamping if assets change
- Warm preloading for likely next selector actions
- Multi-depth parallax scene with runtime tinting and responsive tiling
- Parallax motion only while animation mode is `run`

## Character Rendering Pipeline

1. `buildCharacterLayers` maps current config to ordered `body` and `head` render layers.
2. `useCharacterPreviewRenderer` drives an animation loop with `requestAnimationFrame`.
3. Frame selection uses `getBodyFrameIndex` from `src/render/animation/bodyFrames.ts`.
4. Layered assets draw in this order: mask `bg` -> tint fill -> `outline`.
5. Shared image cache (`getOrCreateImage`, `preloadImages`) avoids duplicate loads.

Draw order:

- Body: legs -> bottom -> top -> arms
- Head: head -> eyes -> mouth -> hair

Implementation details:

- Body and head render on separate canvases so head transforms do not affect body layers.
- Run animation uses a smoothed 3-frame sequence (`0-1-2-1`) where applicable.

## Parallax System

Parallax is composed from scene data in `src/data/background/parallaxScene.ts` and rendered by:

- `src/components/ParallaxLayers.tsx`
- `src/components/ParallaxLayerRow.tsx`
- `src/hooks/useParallaxOffsets.ts`
- `src/hooks/useParallaxTileCounts.ts`
- `src/hooks/useTintedParallaxSources.ts`

Behavior:

- Layers are split by depth (`back` / `front`).
- Each layer is tiled to fill viewport width based on current pixel scale.
- Layer tinting is generated at runtime by `src/render/background/tintBackgroundLayer.ts` and cached by `src + colour`.
- If tint generation fails for one layer, that layer falls back to its original image source (other layers still render).
- Vertical anchoring uses `useFloorY` so layers align to the character floor position.
- Motion is paused unless `anim === "run"`.

## State and Persistence

`CharacterConfigProvider` manages reducer-based state and exposes selector actions via context.

Config shape:

- `parts`: `hair`, `eyes`, `mouth` option IDs
- `colours`: `skin`, `hair`, `top`, `bottom` palette indices

Persistence:

- Stored in localStorage key `character_config_v1`
- Loaded config is clamped against currently available assets/palettes
- Prevents crashes from stale IDs after asset changes

## Asset Pipeline

Assets are discovered with `import.meta.glob` and normalized into typed options.

Supported types:

1. Layered pairs (`head`, `hair`, `body`):
   - `*_bg.png`
   - `*_outline.png`
2. Single-layer files (`eyes`, `mouth`):
   - `*.png`

Examples:

- `hair_3_0_outline.png` + `hair_3_0_bg.png` -> `hair_3_0`
- `body_idle_arms_1_outline.png` + `body_idle_arms_1_bg.png` -> `body_idle_arms_1`
- `eyes0.png` -> `eyes0`

## Project Structure

- `src/components` - app UI, selector controls, canvas and parallax render components
- `src/data/background` - parallax scene and background palette data
- `src/data/character` - asset discovery, pairing, diagnostics, character palettes
- `src/hooks` - scale, floor alignment, parallax motion/tiling/tint hooks
- `src/render/character` - layer composition, renderer loop, image cache, warm preload helpers
- `src/render/background` - background tint generation
- `src/state` - reducer, provider, selectors, available IDs and palettes

## Testing

Vitest coverage currently includes:

- asset pairing and diagnostics (`src/data/character/*.test.ts`)
- reducer/config clamping and selector utilities (`src/state/*.test.ts`)
- canvas renderer and image cache (`src/render/character/*.test.ts`)
- character preview behavior (`src/components/CharacterPreviewCanvas.test.tsx`)
- parallax hooks:
  - `useFloorY` layout reactivity
  - `useParallaxOffsets` run-only motion
  - `useTintedParallaxSources` partial-failure fallback

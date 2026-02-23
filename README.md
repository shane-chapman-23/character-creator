# Pixel Character Creator

A modular pixel-art character creator built with React, TypeScript, and Vite.

Supports layered sprite composition, runtime tinting via CSS masking, and asset-driven configuration with stable ID persistence.

## Motivation

Pixel character creators often rely on pre-rendered colour variants,
which quickly leads to large texture sets and rigid configuration.

This project explores a data-driven approach where:

- character options are derived from available assets
- layered sprites are composed at runtime
- palette swaps are applied via CSS masking

This allows new parts or colours to be added without modifying UI logic
or generating additional textures.

## Quick Start

```bash
npm install
npm run dev
```

Core scripts:

- `npm run dev` - start local development server
- `npm run test` - run Vitest suite
- `npm run build` - production build (TypeScript + Vite)
- `npm run preview` - preview production build locally

## Features

- Layered sprite system (bg + outline pairing)
- Runtime palette swapping without multiple textures
- Asset-driven config (no hardcoded options)
- Stable ID persistence via localStorage
- Dev-time asset diagnostics (missing pairs / duplicates)
- Deterministic reducer-driven state

## Technical Highlights

### Asset Pipeline

Assets are loaded eagerly with Vite `import.meta.glob` and transformed into stable option objects at module initialization time.

Two asset types are supported:

1. Layered assets (`head`, `hair`, `body`) using paired files:

- `*_bg.png`
- `*_outline.png`

2. Single-layer assets (`eyes`, `mouth`) using one `.png` per option.

Layered pairing uses a filename-derived stable key:

- `hair_3_0_outline.png` + `hair_3_0_bg.png` -> `hair_3_0`
- `body_idle_arms_1_outline.png` + `body_idle_arms_1_bg.png` -> `body_idle_arms_1`

Only valid bg/outline pairs are exposed to the UI, preventing runtime composition errors.

### Asset Naming Rules

Layered assets must match:

`<category>_<variant>_<frame>_(outline|bg).png`

- `category`: `[a-z0-9]+` (no underscores), e.g. `hair`, `body`, `head`
- `variant`: `[a-z0-9_]+` (underscores allowed), e.g. `idle_arms`, `run_bottom`
- `frame`: `\\d+`, e.g. `0`, `1`, `12`

Single-layer IDs are derived from filenames (without extension):

- `eyes0.png` -> `eyes0`
- `mouth2.png` -> `mouth2`

### Diagnostics and Safety

In development (`import.meta.env.DEV`), diagnostics report:

- missing layered pairs
- duplicate layered keys
- duplicate single-layer IDs
- unrecognized filenames

Duplicate behavior is deterministic: last write wins, and both paths are reported.
Core pairing/build functions remain pure; diagnostics are reported by a separate dev-only module.

## Architecture

The app is structured into four layers:

- **Asset Pipeline** – Loads and validates sprite assets
- **State Layer** – Reducer-driven config + persistence
- **Render Layer** – Converts config into ordered tinted layers
- **UI Layer** – Preview + selectors

Render composition is handled by `buildCharacterLayers.ts`, which maps selected part IDs into mask-tinted render layers.

## State and Persistence

Character state is reducer-driven and persisted to localStorage using a versioned key:

- `character_config_v1`

Config shape:

- `parts`: stable option IDs for `hair`, `eyes`, `mouth`
- `colours`: palette indices for `skin`, `top`, `bottom`, `hair`

If assets change between sessions, stale persisted IDs are clamped to
available options at startup to keep the render pipeline in a safe state.

Supported reducer actions include:

- set/cycle part
- set/cycle colour
- randomize config
- reset config

## Rendering Model

Layer order is deterministic:

1. Legs
2. Bottom
3. Top
4. Arms
5. Head
6. Eyes
7. Mouth
8. Hair

Tintable layers use:

- `bg` texture as a CSS mask
- `outline` texture as detail on top

This allows palette swaps without pre-rendering many color variants.

## Project Structure

- `src/data` - asset loading, pairing logic, diagnostics, palettes
- `src/state` - config model, reducer, selectors, provider
- `src/render` - render-layer composition
- `src/components` - preview and selector UI

## Testing

Vitest coverage includes:

- layered asset pairing
- single-layer asset ID mapping
- diagnostics reporting behavior
- reducer and config validation logic
- selector utilities (wrap/cycle/random helpers)

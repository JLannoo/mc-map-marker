Purpose
Provide concise, actionable context so an AI coding agent can be immediately productive in this repo.

High level architecture
- Frontend: React + Vite (see `vite.config.ts`, `package.json`). UI built with shadcn-style components and Tailwind (`src/` and `src/components/ui`).
- Map layer: Leaflet is used to render a map (`src/components/Leaflet/Leaflet.tsx`). A custom tile layer implementation lives at `src/lib/ChunkGridLayer/ChunkGridLayer.ts` and is the primary rendering/compute boundary for world data.
- Native/WASM: Biome/finder logic comes from C sources (two places): `cubiomes/` (original library) and `wasm/` (WASM build helpers). JS/WASM bindings and generated artifacts are under `src/lib/wasm/` (e.g. `cubiomes.js`, `cubiomes.wasm`, `cubiomes.d.ts`).

Why these boundaries matter
- The Leaflet component is thin: it only creates the map and injects the ChunkGridLayer. Most heavy work (tile generation, biome lookup) lives in `ChunkGridLayer` and the WASM bindings. Changes to rendering or coordinate math usually affect these two places.

Key developer workflows (executable commands)
- Start dev server: `npm run dev` (Vite). This is the primary fast-edit loop.
- Full production build: `npm run build` — this runs `npm run make` (WASM build via `emmake make`), TypeScript build (`tsc -b`), then `vite build`.
- Build only WASM/native: `npm run make` (calls `emmake make`). If you need to run Makefiles directly, there are `Makefile`s in `cubiomes/` and `wasm/`.
- Lint: `npm run lint`.

Repository conventions and important patterns
- Map store: a small Zustand store `useLeafletStore` in `src/components/Leaflet/Leaflet.tsx` holds the Leaflet map instance and container ref. Use this store to access the map across components.
- Coordinate mapping: frontend code passes coordinates as `leaflet.marker([-z, x])` (see `src/App.tsx`) — note the swap and sign on `z`. Be careful when changing coordinate math.
- CRS and zoom: map uses `leaflet.CRS.Simple` and zoom range `minZoom: 0, maxZoom: 8`. Tile/zoom assumptions are encoded in `ChunkGridLayer`.
- Styling: Leaflet's default CSS is overridden in `src/components/Leaflet/leaflet.overrides.css` to match the shadcn UI look.
- WASM bindings: generated artifacts (`cubiomes.js`, `.wasm`) are consumed from `src/lib/wasm/`. If you change C function names, update the `.d.ts` type file(s) and any call sites.

Cross-component / integration notes
- ChunkGridLayer <-> WASM is the critical integration. Inspect `src/lib/ChunkGridLayer/ChunkGridLayer.ts` for how tiles request biome data and `src/lib/wasm/` for the JS wrapper. Keep API surface small and stable (e.g. single entrypoints for chunk/biome queries).
- UI components are mostly presentational (shadcn patterns). Business logic lives in `src/lib/`.

Editing and rebuilding WASM/C code
- Prerequisite: Emscripten must be installed and available (so `emmake` works). Clone with submodules: `git clone --recurse-submodules ...` to fetch `cubiomes/`.
- Common edit loop:
  1. Edit C in `cubiomes/` or `wasm/`.
  2. Run `npm run make` (or `cd wasm && emmake make`) to regenerate `cubiomes.js` / `cubiomes.wasm`.
  3. Update `src/lib/wasm/cubiomes.d.ts` (and `wasm/cubiomes.d.ts` if present) to reflect any changed exported function names.
  4. Rebuild TypeScript: `tsc -b` (this is part of `npm run build`).

Where to look first when debugging
- Map initialization and lifecycle: `src/components/Leaflet/Leaflet.tsx` (containerRef guard, StrictMode considerations).
- Tile generation and rendering: `src/lib/ChunkGridLayer/ChunkGridLayer.ts`.
- WASM call sites: `src/lib/wasm/*` and any code that imports the generated bindings.
- App integration examples: `src/App.tsx` demonstrates marker creation (`leaflet.marker([-z, x])`) and popup markup.

Small code examples (copyable intent)
- Add a marker (example already in repo): leaflet.marker([-z, x]).addTo(map) — popup HTML is plain string templates (see `src/App.tsx`).

Tests and quality gates
- There are no automated tests in the repo. CI and preflight are local: `npm run lint`, `tsc -b`, and `npm run make` for WASM.

If something's missing or ambiguous
- If Makefile output paths differ, check `cubiomes/Makefile` and `wasm/Makefile` to confirm where `cubiomes.js` and `.wasm` are written; update `src/lib/wasm` or imports accordingly.

Next steps for the agent
- When asked to implement features, prefer changing `ChunkGridLayer` + `src/lib/wasm` first for anything related to map tiles or biome lookups. For UI changes, update components under `src/components/ui` and `src/App.tsx`.

Ask me where more detail is needed (specific functions, Makefile behavior, or the expected shape of WASM exports).

(This file was AI generated based on recent edits to the repository. If you find any inaccuracies or missing information, please update the file accordingly.)

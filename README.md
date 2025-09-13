# MC Map Marker

## Table of Contents
- [About](#about)
- [How to clone](#how-to-clone)
- [How to build](#how-to-build)
- [Important Notes](#important-notes)
- [External Docs](#external-docs)

## About
MC Map Marker is a web application for visualizing and marking Minecraft worlds using Leaflet and WASM bindings to native biome-finding code.

## How to Clone
```sh
git clone --recurse-submodules https://github.com/JLannoo/mc-map-marker.git
```

## How to Build
- **Build WASM:**
  - Ensure you have Emscripten installed for building WASM from C code.
  - Ensure you got the Cubiomes submodule from git.
  - Run the build script or use the provided Makefile in `cubiomes/` and `wasm/`.
    ```sh
    emmake make
    ```
    or
    ```sh
    npm run make
    ```

- **Start the development server:**
  ```sh
  npm run dev
  ```

- **Build for production:**
  Runs both Vite build and Make
  ```sh
  npm run build
  ```

## Important Notes
### WASM
  - If you use VSCode: when you install Emscripten, make sure you add the `${emscripten_root}/upstream/emscripten/system/include` folder to your workspace's includePath in `c_cpp_properties.json`. This will make VSCode aware of the Emscripten-specific headers.
  - Bindings must be renamed if the function name changes in the C source file.
  - For the JS module to find the WASM binary, the must share the same base name and be in the same directory.
  - The JS/WASM bindings consumed by the frontend are under `src/lib/wasm/` (for example `cubiomes.js`, `cubiomes.wasm`, and `cubiomes.d.ts`). When you rebuild the WASM, ensure these files are updated and the `.d.ts` matches the exported function names.
    - They get stored there so Vite can bundle them correctly with the rest of the frontend code.

### Map and coordinate conventions

- Leaflet uses (latitude, longitude) coordinates, which map to 
(y, x) in a Cartesian system. Latitude increases upwards, Longitude increases rightwards.
- Minecraft uses (x, z) coordinates for horizontal planes, with y being vertical height. X increases rightwards, Z increases downwards.
- Minecraft negative Z (up) is north.
- **So, the mapping ends up being: MC (x, z) <-> Leaflet (-lat, lng)**.
- The conversion functions are in [`src/lib/utils.ts`](./src/lib/utils.ts).

### Dev / Debugging tips

- Common Emscripten build issues:
  - Ensure your shell has the Emscripten environment sourced (the `emcc`/`emmake` commands must be on PATH).
  - If the make step cannot find headers, verify the include path and that `emsdk` was activated for the current shell.
- If the frontend complains about missing `cubiomes.js`/`.wasm`, confirm you ran `emmake make` and the output was copied/available in `src/lib/wasm/` or adjust imports.


## External Docs
### Frontend
  - [Leaflet](https://leafletjs.com/)
  - [Zustand](https://github.com/pmndrs/zustand)
  - [shadcn UI](https://ui.shadcn.com/)
  - [TailwindCSS](http://tailwindcss.com/docs/)
### WASM / C
- [Cubiomes library](https://github.com/Cubitect/cubiomes)
- [Compiling C to WASM (MDN)](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/C_to_Wasm)
- [Emscripten](https://emscripten.org/)

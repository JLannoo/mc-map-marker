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
  - Bindings must be renamed if the function name changes in the C source file.
  - Declare modules extending `window` for Typescript to be able to see them.
  - ...


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

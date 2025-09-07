const module = await window.CubiomesCreateModule();
console.log("Loading WASM Module...");

if(!module) throw new Error("WASM Module not loaded");
console.log("WASM Module loaded:", module);

export function fetchChunkData(seed: bigint, x: number, z: number, y: number = 15, pix4cell: number = 4): Uint8Array {
    const bufferPointer = module.ccall(
            'fetchChunkData', // name of C function
            'number', // return type
            ['number', 'number', 'number', 'number', 'number'], // argument types
            [seed, x, z, y, pix4cell] // arguments
    );
    
    // if(bufferPointer === 0) throw new Error("Error fetching chunk data from wasm module");

    // Memory size: 3 bytes per pixel (RGB) * 64 pixels * 64 pixels
    const rgbSize = 3 * 64 * 64;
    // View into wasm buffer
    const rgbArray = new Uint8Array(module.HEAPU8.buffer, bufferPointer, rgbSize);

    return rgbArray;
}

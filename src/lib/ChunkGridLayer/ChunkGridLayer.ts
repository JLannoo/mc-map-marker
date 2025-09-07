import L from "leaflet";

import { fetchChunkData } from "../wasm-bindings/cubiomes";

export const ChunkGridLayer = L.GridLayer.extend({
    createTile: function(coords: L.Coords) {
        const tile = generateChunkTile(1234567890123456789n, coords.x, -coords.y, coords.z, 512);
        return tile;
    },
});

function generateChekeredTile(coords: L.Coords, size: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const chunkX = coords.x;
    const chunkY = coords.y;
    const chunkZ = coords.z;
    
    ctx.fillStyle = (Math.abs(chunkX % 2) === Math.abs(chunkY % 2)) ? '#e0e0e0' : '#c0c0c0';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.strokeRect(0, 0, size, size);    

    ctx.fillStyle = 'black';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`(${chunkZ}, ${chunkX}, ${chunkY})`, size / 2, size / 2);

    return canvas;
}

export function generateChunkTile(seed: bigint, chunkX: number, chunkY: number, chunkZ: number, size: number = 512): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const chunkData = fetchChunkData(seed, chunkX, chunkY, chunkZ, 4);
    const imageData = ctx.createImageData(64, 64);

    for (let i = 0; i < 64 * 64; i++) {
        imageData.data[i * 4 + 0] = chunkData[i * 3 + 0]; // R
        imageData.data[i * 4 + 1] = chunkData[i * 3 + 1]; // G
        imageData.data[i * 4 + 2] = chunkData[i * 3 + 2]; // B
        imageData.data[i * 4 + 3] = 255;                  // A
    }

    ctx.putImageData(imageData, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, 64, 64, 0, 0, size, size);

    drawTextOnTile(ctx, `(${chunkZ}, ${chunkX}, ${chunkY})`, size, 'white');
    canvas.style.border = "1px solid rgba(255,255,255,0.01)"
    return canvas;
}

function drawTextOnTile(ctx: CanvasRenderingContext2D, text: string, size: number, color: string = 'black') {
    ctx.fillStyle = color;
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2);
}
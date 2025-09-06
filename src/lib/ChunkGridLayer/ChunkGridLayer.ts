import L from "leaflet";

export const ChunkGridLayer = L.GridLayer.extend({
    createTile: function(coords: L.Coords) {
        const tile = generateTile(coords, 512);
        return tile;
    },
});

function generateTile(coords: L.Coords, size: number): HTMLCanvasElement {
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
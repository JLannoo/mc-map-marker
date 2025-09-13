import L from 'leaflet';

import { getChunkgenWorkerPool } from '../wasm/workers/workerPool';

import LEAFLET from '@/consts/LEAFLET';
import { Coords } from '@/lib/utils';

/**
 * A Leaflet GridLayer that generates and displays map tiles, using the Cubiomes WASM module, on a canvas.
 * 
 * Tiles are generated asynchronously in a pool of web workers.
 * If a worker fails, a fallback checkerboard tile is displayed.
 */
export const ChunkGridLayer = L.GridLayer.extend({
	createTile: function(coords: L.Coords, done: L.DoneCallback): HTMLCanvasElement {
		const canvas = document.createElement('canvas');
		canvas.width = LEAFLET.TILE_SIZE;
		canvas.height = LEAFLET.TILE_SIZE;
		const ctx = canvas.getContext('2d');
		if (!ctx) return canvas;

		const pool = getChunkgenWorkerPool();
		const seed = 1234567890123456789n;
		const { x: chunkX, z: chunkZ } = Coords.tileToChunk(coords);
		const zoom = coords.z;		

		// Fire request: when data arrives, paint the canvas
		pool.request('generateBiomes', { seed, x: chunkX, z: chunkZ, y: 0, pix4cell: 4, zoomLevel: zoom }).then((buffer) => {
			// TODO: Investigate how to improve performance.
			// Potential:
			// - Use OffscreenCanvas in the worker to draw directly there (not supported in all browsers)
			// - Use ImageBitmap to transfer the image data more efficiently
			// - Delegate generation to a dedicated GPU worker (WebGL / WebGPU)
			// - Delegate generation to WASM
			const rgb = new Uint8Array(buffer);
			const imageData = ctx.createImageData(LEAFLET.TILE_SIZE, LEAFLET.TILE_SIZE);

			for (let i = 0; i < 64 * 64; i++) {
				imageData.data[i * 4 + 0] = rgb[i * 3 + 0];
				imageData.data[i * 4 + 1] = rgb[i * 3 + 1];
				imageData.data[i * 4 + 2] = rgb[i * 3 + 2];
				imageData.data[i * 4 + 3] = 255;
			}

			ctx.putImageData(imageData, 0, 0);
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(canvas, 0, 0, 64, 64, 0, 0, LEAFLET.TILE_SIZE, LEAFLET.TILE_SIZE);

			const showGrid = true;
			if(showGrid) {
				ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
				ctx.strokeRect(0, 0, LEAFLET.TILE_SIZE, LEAFLET.TILE_SIZE);    
				ctx.font = '12px Arial';
				ctx.textAlign = 'left';
				ctx.textBaseline = 'top';
				ctx.strokeStyle = '';
				ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
				ctx.fillText(`(${chunkX},${chunkZ})`, 1, 1);
			}

			done(undefined, canvas);
		}).catch((err) => {
			// fallback to checker if worker fails
			console.warn('[ChunkGridLayer] Tile generation failed', err);
			const checker = _generateChekeredTile(coords, LEAFLET.TILE_SIZE);
			ctx.drawImage(checker, 0, 0);

			done(undefined, canvas);
		});
		

		return canvas;
	},
}).mergeOptions({
	tileSize: LEAFLET.TILE_SIZE,
	attribution: '<a href="https://github.com/cubitect/cubiomes" target="_blank" rel="noreferrer">Cubiomes</a> map generation',
});

function _generateChekeredTile(coords: L.Coords, size: number): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d');
	if (!ctx) return canvas;

	const { x: chunkX, z: chunkZ } = Coords.tileToChunk(coords);
	const chunkY = coords.y;
    
	ctx.fillStyle = (Math.abs(chunkX % 2) === Math.abs(chunkY % 2)) ? '#e0e0e0' : '#c0c0c0';
	ctx.fillRect(0, 0, size, size);
	ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
	ctx.strokeRect(0, 0, size, size);    

	ctx.fillStyle = 'black';
	ctx.font = '12px Arial';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(`(${chunkZ}, ${chunkX}, ${chunkY})`, size / 2, size / 2);

	return canvas;
}

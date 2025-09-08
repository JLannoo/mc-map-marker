import L from 'leaflet';

import { getChunkgenWorkerPool } from '../wasm/workers/workerPool';


import LEAFLET from '@/consts/LEAFLET';

export const ChunkGridLayer = L.GridLayer.extend({
	createTile: function(coords: L.Coords, done: L.DoneCallback): HTMLCanvasElement {
		// create an empty canvas and kick off async generation in a worker
		const canvas = document.createElement('canvas');
		canvas.width = LEAFLET.TILE_SIZE;
		canvas.height = LEAFLET.TILE_SIZE;
		const ctx = canvas.getContext('2d');
		if (!ctx) return canvas;

		const pool = getChunkgenWorkerPool();
		const seed = 1234567890123456789n;
		const chunkX = coords.x;
		const chunkZ = -coords.y;		

		// fire request: when data arrives, paint the canvas
		pool.request(seed, chunkX, chunkZ).then((buffer) => {
			const rgb = new Uint8Array(buffer);
			const imageData = ctx.createImageData(64, 64);

			for (let i = 0; i < 64 * 64; i++) {
				imageData.data[i * 4 + 0] = rgb[i * 3 + 0];
				imageData.data[i * 4 + 1] = rgb[i * 3 + 1];
				imageData.data[i * 4 + 2] = rgb[i * 3 + 2];
				imageData.data[i * 4 + 3] = 255;
			}

			ctx.putImageData(imageData, 0, 0);
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(canvas, 0, 0, 64, 64, 0, 0, LEAFLET.TILE_SIZE, LEAFLET.TILE_SIZE);

			done(undefined, canvas);
		}).catch((_err) => {
			// fallback to checker if worker fails
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

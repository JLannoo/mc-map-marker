/**
 * This web worker handles chunk generation requests using the Cubiomes WASM module.
 * Must be generally called via a WorkerPool to manage multiple workers.
 */

import { fetchChunkData } from '../bindings/cubiomes';
import type { WorkerErrorResponse, WorkerRequest, WorkerResponse } from './workers';

export type ChunkgenWorkerMap = {
	'generateBiomes': {
		request: WorkerRequest<'generateBiomes', {
			seed: bigint | number;
			x: number;
			z: number;
			y?: number;
			pix4cell?: number;
			zoomLevel?: number;
		}>;
		response: WorkerResponse<ArrayBuffer> | WorkerErrorResponse;
	},
}

// notify main thread that worker (and wasm module) is initialized and ready to accept requests
self.postMessage({ ready: true });

// TODO: handle different message types
self.addEventListener('message', (ev) => {
	try {
		const data = ev.data as ChunkgenWorkerMap[keyof ChunkgenWorkerMap]['request'];

		switch (data.type) {
		case 'generateBiomes': {
			const { id, payload } = data;
			const { seed, x, z, y = 0, pix4cell = 4, zoomLevel = 4 } = payload;

			const buffer = fetchChunkData(BigInt(seed), x, z, y, pix4cell, zoomLevel);

			// copy into a transferable buffer
			const copy = new Uint8Array(buffer.byteLength);
			copy.set(new Uint8Array(buffer));

			self.postMessage({ id, payload: copy.buffer}, [copy.buffer]);
			return;
		}

		default:
			self.postMessage({ id: data.id, error: `unknown message type: ${data.type}` });
			return;
		}

	} catch (err) {
		let id = -1;

		if (typeof ev.data === 'object' && ev.data !== null) {
			const r = ev.data as Record<string, unknown>;
			if ('id' in r && typeof r.id === 'number') id = r.id as number;
		}

		const res = { id, error: (err as Error).message };
		self.postMessage(res);
	}
});

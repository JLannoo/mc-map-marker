import { fetchChunkData } from '../bindings/cubiomes';

type Req = {
  id: number;
  seed: bigint | number;
  x: number;
  z: number;
  y?: number;
  pix4cell?: number;
};

type Res = {
  id: number;
  buffer?: ArrayBuffer;
  error?: string;
};

// notify main thread that worker (and wasm module) is initialized and ready to accept requests
self.postMessage({ ready: true });

self.addEventListener('message', (ev) => {
	try {
		const msg = ev.data as Req;
		const { id, seed, x, z, y = 15, pix4cell = 4 } = msg;

		const rgb = fetchChunkData(seed as bigint, x, z, y, pix4cell);
		
		// Transfer the underlying buffer to avoid cloning large arrays
		const copy = new Uint8Array(rgb.length);
		copy.set(rgb);

		const res: Res = { id, buffer: copy.buffer };
		self.postMessage(res, [copy.buffer]);
	} catch (err) {
		const res: Res = { id: ev.data.id, error: (err as Error).message };
		self.postMessage(res);
	}
});

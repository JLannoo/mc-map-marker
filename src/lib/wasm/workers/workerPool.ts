import ChunkgenWorker from './chunkgen.worker?worker';

type ChunkRequest = {
  id: number;
  seed: bigint;
  x: number;
  z: number;
  y?: number;
  pix4cell?: number;
};

type ChunkResponse = {
  id: number;
  buffer?: ArrayBuffer;
  error?: string;
};

/**
 * A pool to manage request to web workers.
 * Each worker is expected to respond with messages containing the same `id` as the request.
 */
export class WorkerPool {
	private workers: Worker[] = [];
	private ready: boolean[] = [];
	private nextWorker = 0;
	private nextId = 1;
	private pending = new Map<number, (res: ChunkResponse) => void>();

	constructor(workerConstructor: new (options?: WorkerOptions) => Worker, size: number = navigator.hardwareConcurrency || 4) {
		for (let i = 0; i < size; i++) {
			try {
				const worker = new workerConstructor();
				this.ready[i] = false;

				worker.onmessage = (ev: MessageEvent) => {
					const data = ev.data as unknown;
					
					if (this.isReadyMessage(data)) {
						this.ready[i] = true;
						return;
					}

					this.onMessage(data as ChunkResponse);
				};

				this.workers.push(worker);
			} catch (err) {
				console.error('[WorkerPool] failed to create worker', i, err);
			}
		}
	}

	private onMessage(msg: ChunkResponse) {
		const callback = this.pending.get(msg.id);
		if (callback) {
			this.pending.delete(msg.id);
			callback(msg);
		}
	}

	private isReadyMessage(v: unknown): v is { ready: boolean } {
		return typeof v === 'object' && v !== null && ('ready' in v);
	}

	// TODO: support generic requests instead of just chunk requests
	request(seed: bigint, x: number, z: number, y: number = 15, pix4cell: number = 4): Promise<ArrayBuffer> {
		const id = this.nextId++;
		// pick a worker round-robin
		const worker = this.workers[this.nextWorker];
		this.nextWorker = (this.nextWorker + 1) % this.workers.length;

		// wait for at least one worker to be ready
		const timeoutMs = 2000;
		const waitForReady = () => new Promise<void>((resolve) => {
			const start = performance.now();

			if (this.ready.some(Boolean)) return resolve();

			const iv = setInterval(() => {
				if (this.ready.some(Boolean)) {
					clearInterval(iv);
					resolve();
					return;
				}

				if (performance.now() - start > timeoutMs) { // timeout fallback
					clearInterval(iv);
					resolve();
				}
			}, 100);
		});

		const req: ChunkRequest = { id, seed, x, z, y, pix4cell };

		return new Promise<ArrayBuffer>((resolve, reject) => {
			waitForReady().then(() => {
				// post after wait
				this.pending.set(id, (res) => {
					if (res.error) reject(new Error(res.error));
					else if (res.buffer) resolve(res.buffer);
					else reject(new Error('empty response'));
				});

				try {
					worker.postMessage(req);
				} catch (err) {
					this.pending.delete(id);
					reject(err);
				}
			}).catch((err) => reject(err));
		});
	}

	destroy() {
		for (const w of this.workers) w.terminate();
		this.workers = [];
	}
}

// Single shared pool instance helper
let chunkgenPool: WorkerPool | null = null;
export function getChunkgenWorkerPool(): WorkerPool {
	if (!chunkgenPool) {
		chunkgenPool = new WorkerPool(ChunkgenWorker, navigator.hardwareConcurrency || 4);
	}
	return chunkgenPool;
}

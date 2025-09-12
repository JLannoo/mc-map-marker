import ChunkgenWorker from './chunkgen.worker?worker';
import type { ChunkgenWorkerMap } from './chunkgen.worker';

import type { BaseMessageMap, MessageNames, RequestPayload, ResponsePayload, WorkerRequest } from './workers';

/**
 * A pool to manage request to web workers.
 * Each worker is expected to respond with messages containing the same `id` as the request.
 */
export class WorkerPool<M extends BaseMessageMap> {
	private workers: Worker[] = [];
	private ready: boolean[] = [];
	private nextWorker = 0;
	private nextId = 1;
	private pending = new Map<number, (res: unknown) => void>();

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

					this.onMessage(data);
				};

				this.workers.push(worker);
			} catch (err) {
				console.error('[WorkerPool] failed to create worker', i, err);
			}
		}
	}

	private onMessage(msg: unknown) {
		if(!msg) return;

		// Match response to pending request by id
		if (typeof msg === 'object' && 'id' in msg && typeof msg.id === 'number') {
			const id = msg.id;
			const callback = this.pending.get(id);

			if (callback) {
				this.pending.delete(id);
				callback(msg);
			}
		}
	}

	private isReadyMessage(v: unknown): v is { ready: boolean } {
		return typeof v === 'object' && v !== null && ('ready' in v);
	}

	// Generic request by message key K in MessageMap M
	request<K extends MessageNames<M>>(key: K, payload: RequestPayload<M, K>): Promise<ResponsePayload<M, K>> {
		const id = this.nextId++;
		const worker = this.workers[this.nextWorker];
		this.nextWorker = (this.nextWorker + 1) % this.workers.length;

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

		const req = { id, type: key as string, payload } as WorkerRequest<K & string, RequestPayload<M, K>>;

		return new Promise<ResponsePayload<M, K>>((resolve, reject) => {
			waitForReady().then(() => {
				// post after wait
				this.pending.set(id, (res) => {
					if (typeof res === 'object' && res !== null) {
						const r = res as Record<string, unknown>;						

						// Check if worker errored
						if ('error' in r && typeof r.error === 'string') {
							reject(new Error(r.error));
							return;
						}

						if ('payload' in r) {
							resolve(r.payload as ResponsePayload<M, K>);
							return;
						}
					}
					
					reject(new Error('empty response'));
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
let chunkgenPool: WorkerPool<ChunkgenWorkerMap> | null = null;
export function getChunkgenWorkerPool(): WorkerPool<ChunkgenWorkerMap> {
	if (!chunkgenPool) {
		chunkgenPool = new WorkerPool(ChunkgenWorker, navigator.hardwareConcurrency || 4);
	}
	return chunkgenPool;
}

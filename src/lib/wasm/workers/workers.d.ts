export type WorkerRequest<Type extends string, Payload> = {
    id: number;
    type: Type;
    payload: Payload;
}

export type WorkerResponse<Payload> = {
    id: number;
    payload: Payload;
}

export type WorkerErrorResponse = {
    id: number;
    error: string;
};

export type ReadyMessage = {
    ready: boolean;
};

export type BaseMessageMap = Record<string, { request: unknown; response: unknown }>;
export type MessageNames<M extends BaseMessageMap> = keyof M & string;

export type RequestPayload<M extends BaseMessageMap, T extends MessageNames<M>> = M[T]['request'] extends { payload: infer P } ? P : never;
export type ResponsePayload<M extends BaseMessageMap, T extends MessageNames<M>> = M[T]['response'] extends { payload: infer P } ? P : never;

// Re-export commonly used base types for local imports
export type { WorkerRequest as BaseWorkerRequest, WorkerResponse as BaseWorkerResponse };


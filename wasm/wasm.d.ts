export type WASMModule = {
    ccall: (ident: string, returnType: string | null, argTypes: string[], args: unknown[]) => number;
    HEAPU8: Uint8Array;
};
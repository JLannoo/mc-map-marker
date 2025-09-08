export declare function CubiomesCreateModule(moduleArg?: unknown): Promise<{
    ccall: (ident: string, returnType: string | null, argTypes: string[], args: unknown[]) => number;
    HEAPU8: { buffer: ArrayBuffer };
}>;

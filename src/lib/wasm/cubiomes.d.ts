/**
 * These definitions are derived from the Emscripten-generated JavaScript module for Cubiomes.
 * To change these, change the Makefile target build flags and regenerate the bindings.
 */
declare function CubiomesCreateModule(moduleArg?: unknown): Promise<{
    ccall: (ident: string, returnType: string | null, argTypes: string[], args: unknown[]) => number;
    HEAPU8: { buffer: ArrayBuffer };
}>;

export default CubiomesCreateModule;
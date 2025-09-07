declare global {
    interface Window {
        CubiomesCreateModule: () => Promise<WASMModule>;
    }
}

export {};

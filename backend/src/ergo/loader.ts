class ErgoWasmLoader {
  private _wasm: // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    typeof import('ergo-lib-wasm-nodejs') | undefined = undefined;

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async load() {
    if (this._wasm != null) return;
    this._wasm = await import('ergo-lib-wasm-nodejs');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get Ergo() {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    return this._wasm as typeof import('ergo-lib-wasm-nodejs');
  }
}

export const Loader = new ErgoWasmLoader();
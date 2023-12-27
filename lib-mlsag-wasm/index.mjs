const wasmData = await (async () => {
  const url = new URL("./lib.wasm", import.meta.url);
  if (typeof window !== "undefined") {
    // browser
    return fetch(url).then((res) => res.arrayBuffer());
  } else {
    // node
    const fs = await import("fs");
    return fs.readFileSync(url);
  }
})();

const module = await WebAssembly.compile(wasmData);

const instance = await WebAssembly.instantiate(module, {
  env: {
    generate_random_bytes_thread_safe: (
      /** @type {number} */ size,
      /** @type {number} */ addr
    ) => {
      const data = new Uint8Array(memory.buffer).subarray(addr, addr + size);
      if (crypto.getRandomValues) {
        // browser
        crypto.getRandomValues(data);
      } else {
        // node
        // @ts-ignore
        crypto.webcrypto.getRandomValues(data);
      }
    },
    __cxa_allocate_exception: (/** @type {number} */ a) => {
      throw new Error("__cxa_allocate_exception");
      return 0;
    },
    __cxa_throw: (
      /** @type {number} */ a,
      /** @type {number} */ b,
      /** @type {number} */ c
    ) => {
      throw new Error("__cxa_throw");
    },
  },
  wasi_snapshot_preview1: {
    args_get: (/** @type {number} */ a, /** @type {number} */ b) => {
      throw new Error("args_get");
      return 0;
    },
    args_sizes_get: (/** @type {number} */ a, /** @type {number} */ b) => {
      throw new Error("args_sizes_get");
      return 0;
    },
    fd_close: (/** @type {number} */ a) => {
      throw new Error(`fd_close`);
      return 0;
    },
    fd_seek: (
      /** @type {number} */ a,
      /** @type {number} */ b,
      /** @type {number} */ c,
      /** @type {number} */ d
    ) => {
      throw new Error(`fd_seek`);
      return 0;
    },
    fd_write: (
      /** @type {number} */ a,
      /** @type {number} */ b,
      /** @type {number} */ c,
      /** @type {number} */ d
    ) => {
      throw new Error(`fd_write`);
      return 0;
    },
    proc_exit: (/** @type {number} */ a) => {
      throw new Error(`proc_exit`);
    },
  },
});

export const memory = /** @type {WebAssembly.Memory} */ (
  instance.exports.memory
);

export const wasm = /**
 * @type {{
 * allocate_keys: (keys_amount: number) => number,
 * free_keys: (addr: number) => void,
 * skGen: (key_addr: number) => void,
 * scalarmultBase: (out_addr: Number, priv_key_addr: number) => void,
 * LSAG_Signature: (public_keys_length: number, keys_addr: number) => number
 * }}
 */ (instance.exports);

export const memoryView = new Uint8Array(memory.buffer);

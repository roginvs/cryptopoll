import fs from "fs";
import crypto from "crypto";

const memory = new WebAssembly.Memory({
  initial: 100,
  maximum: 1000,
});

const wasmData = fs.readFileSync("./lib-mlsag-C/build/main.wasm");

const module = await WebAssembly.compile(wasmData);

const instance = await WebAssembly.instantiate(module, {
  env: {
    memory: memory,
    generate_random_bytes_thread_safe: (size, addr) => {
      console.info("koko1", addr, size);
      /*
      const data = new Uint8Array(memory.buffer).subarray(addr, addr + size);
      
      crypto.webcrypto.getRandomValues(data);
      console.info(
        "koko2",
        new Uint8Array(memory.buffer)[addr],
        new Uint8Array(memory.buffer)[addr + 1]
      );
      */
      for (let i = addr; i < addr + size; i++) {
        new Uint8Array(memory.buffer)[i] = 1;
      }
      //asadsadsad;
    },
    __cxa_allocate_exception: (a) => 0,
    __cxa_throw: (a, b, c) => {},
  },
  wasi_snapshot_preview1: {
    args_get: (a, b) => {
      throw new Error("args_get");
      return 0;
    },
    args_sizes_get: (a, b) => {
      throw new Error("args_sizes_get");
      return 0;
    },
    fd_close: (a) => {
      throw new Error(`fd_close`);
      return 0;
    },
    fd_seek: (a, b, c, d) => {
      throw new Error(`fd_seek`);
      return 0;
    },
    fd_write: (a, b, c, d) => {
      throw new Error(`fd_write`);
      return 0;
    },
    proc_exit: (a) => {
      throw new Error(`proc_exit`);
    },
  },
});

console.info(instance.exports);
const keys_addr = instance.exports.allocate_keys(4);
console.info(keys_addr);
instance.exports.skGen(keys_addr);

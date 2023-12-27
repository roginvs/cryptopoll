//const memory = new WebAssembly.Memory({
//  initial: 100,
//  maximum: 1000,
//});

const wasmData = await fetch("./lib-mlsag-C/build/main.wasm").then((res) =>
  res.arrayBuffer()
);

const module = await WebAssembly.compile(wasmData);

const instance = await WebAssembly.instantiate(module, {
  env: {
    // memory: memory,
    generate_random_bytes_thread_safe: (size, addr) => {
      const data = new Uint8Array(memory.buffer).subarray(addr, addr + size);
      crypto.getRandomValues(data);
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

const memory = instance.exports.memory;
console.info(instance.exports);
const keys_addr = instance.exports.allocate_keys(4);
console.info(keys_addr);
for (let i = 0; i < 32; i++) {
  const pk = [
    18, 88, 30, 112, 161, 146, 174, 185, 172, 20, 17, 179, 109, 17, 252, 6, 57,
    61, 181, 89, 152, 25, 4, 145, 192, 99, 128, 122, 107, 77, 115, 13,
  ];
  new Uint8Array(memory.buffer)[keys_addr + i] = pk[i];
}

//instance.exports.skGen(keys_addr);
instance.exports.scalarmultBase(keys_addr + 32, keys_addr);

for (let i = 0; i < 32; i++) {
  console.info(new Uint8Array(memory.buffer)[keys_addr + i + 32].toString(16));
}
//12581e70a192aeb9ac1411b36d11fc06393db55998190491c063807a6b4d730d
//14e35209936de59710e4a3a55b1887a6f3a390c0b1b2d132a0158ff3b60581e0

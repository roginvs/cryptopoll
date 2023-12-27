import { memory, memoryView, wasm } from "./lib.mjs";

const keys_addr = wasm.allocate_keys(4);
console.info(keys_addr);
for (let i = 0; i < 32; i++) {
  const pk = [
    18, 88, 30, 112, 161, 146, 174, 185, 172, 20, 17, 179, 109, 17, 252, 6, 57,
    61, 181, 89, 152, 25, 4, 145, 192, 99, 128, 122, 107, 77, 115, 13,
  ];
  memoryView[keys_addr + i] = pk[i];
}

wasm.scalarmultBase(keys_addr + 32, keys_addr);

for (let i = 0; i < 32; i++) {
  console.info(new Uint8Array(memory.buffer)[keys_addr + i + 32].toString(16));
}
//12581e70a192aeb9ac1411b36d11fc06393db55998190491c063807a6b4d730d
//14e35209936de59710e4a3a55b1887a6f3a390c0b1b2d132a0158ff3b60581e0

const publicKey = [
  20, 227, 82, 9, 147, 109, 229, 151, 16, 228, 163, 165, 91, 24, 135, 166, 243,
  163, 144, 192, 177, 178, 209, 50, 160, 21, 143, 243, 182, 5, 129, 224,
];

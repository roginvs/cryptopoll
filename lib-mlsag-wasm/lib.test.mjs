import test from "node:test";
import { memoryView, wasm } from "./lib.mjs";
import assert from "node:assert";

test("Wasm library", () => {
  const privateKey = [
    18, 88, 30, 112, 161, 146, 174, 185, 172, 20, 17, 179, 109, 17, 252, 6, 57,
    61, 181, 89, 152, 25, 4, 145, 192, 99, 128, 122, 107, 77, 115, 13,
  ];
  const publicKey = [
    20, 227, 82, 9, 147, 109, 229, 151, 16, 228, 163, 165, 91, 24, 135, 166,
    243, 163, 144, 192, 177, 178, 209, 50, 160, 21, 143, 243, 182, 5, 129, 224,
  ];

  const keys_addr = wasm.allocate_keys(2);
  for (let i = 0; i < 32; i++) {
    memoryView[keys_addr + i] = privateKey[i];
  }
  wasm.scalarmultBase(keys_addr + 32, keys_addr);

  for (let i = 0; i < 32; i++) {
    assert.strictEqual(memoryView[keys_addr + i + 32], publicKey[i]);
  }
});

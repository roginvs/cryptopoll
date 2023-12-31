import { memoryView, wasm } from "../lib-mlsag-wasm/index.mjs";
import { stringToUTF8Array } from "./stringToUtf8Array.mjs";

/**
 * @param {string} message
 */
export function getMessageHash(message) {
  const array = new Uint8Array(stringToUTF8Array(message));

  // It is wrong to use keys allocator but it works anyway
  const bufAddr = wasm.allocate_keys(Math.ceil(array.length / 32));

  memoryView.set(array, bufAddr);

  const hashAddr = wasm.allocate_keys(1);

  wasm.cn_fast_hash(hashAddr, bufAddr, array.length);

  const out = new Uint8Array(32);
  out.set(memoryView.subarray(hashAddr, hashAddr + 32));

  wasm.free_keys(hashAddr);
  wasm.free_keys(bufAddr);
  return out;
}

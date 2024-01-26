import { keccak } from "../lib-mlsag-wasm/index.mjs";
import { stringToUTF8Array } from "./stringToUtf8Array.mjs";

/**
 * @param {string} message
 */
export function getMessageHash(message) {
  return keccak(new Uint8Array(stringToUTF8Array(message)));
}

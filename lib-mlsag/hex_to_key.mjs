import { hex_to_array } from "./bytes.mjs";

/**
 *
 * @param {string|Uint8Array} s
 * @returns {import("./mlsag.types").Key}
 */
export function hex_to_key(s) {
  if (!s) {
    throw new Error(`No value`);
  }
  if (typeof s === "object") {
    return s;
  }
  const k = hex_to_array(s);
  if (k.length !== 32) {
    throw new Error("Wrong length");
  }
  return k;
}

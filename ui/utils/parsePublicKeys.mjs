import { hex_to_key } from "../../lib-mlsag-js/hex_to_key.mjs";
import {
  get_public_key_buf_from_ssh_ed25519_public_key,
  is_ssh_ed25519_public_key,
} from "./sshkeys.mjs";

/**
 *
 * @param {string} elementValue
 */

export function parsePublicKeys(elementValue) {
  /** @type {Uint8Array[]} */
  const ringPubKeys = [];
  for (const str of elementValue
    .split("\n")
    .map((x) => x.trim())
    .filter((x) => x)
    .filter((x) => !x.startsWith("#"))) {
    try {
      if (is_ssh_ed25519_public_key(str)) {
        ringPubKeys.push(get_public_key_buf_from_ssh_ed25519_public_key(str));
      } else {
        const buf = hex_to_key(str);
        ringPubKeys.push(buf);
      }
    } catch {
      throw new Error(`Failed to read public key: ${str}`);
    }
  }
  if (ringPubKeys.length === 0) {
    throw new Error(`No public keys provided!`);
  }
  if (ringPubKeys.length === 1) {
    throw new Error(`Only one public key provided!`);
  }

  return ringPubKeys;
}

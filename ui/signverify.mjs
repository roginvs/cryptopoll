import { hex_to_key } from "../lib-mlsag-js/hex_to_key.mjs";

export const ring_pub_keys_placeholder_text =
  "# Here is a list of all participants public keys\n" +
  "# Empty lines and lines starting with # are ignored\n" +
  "# Example:\n\n" +
  "# Vasilii\naabbcc.....\n\n" +
  "# Mariia\neeffdd.....\n";

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
      const buf = hex_to_key(str);
      ringPubKeys.push(buf);
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

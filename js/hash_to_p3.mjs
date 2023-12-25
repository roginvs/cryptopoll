import { point_power } from "./ed25519.mjs";
import { ge_fromfe_frombytes_vartime } from "./hash_to_point.mjs";
import { Keccak } from "./keccak.mjs";

/**
 *
 * @param {import("./mlsag.types").Key} k
 */
export function hash_to_p3(k) {
  const hash_key = Keccak.keccak256(k);
  const hash_p3 = ge_fromfe_frombytes_vartime(hash_key);
  const hash_p = point_power(hash_p3, 8n);
  return hash_p;
}

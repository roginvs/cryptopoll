import { array_to_bigint_LE } from "./bytes.mjs";
import { fe_sqrtm1, inverse, module_power, p, sqrt } from "./ed25519.mjs";

/**
 * @param {bigint} hash
 * @returns {import("./ed25519.types").Point3}
 */
export function hash_to_point(hash) {
  const u = hash % p;

  const A = 486662n;

  let x, y, v, w;
  const fe_ma2 = p - ((A * A) % p);

  v = (2n * u * u) % p;
  w = 1n;
  w = (v + w) % p;
  x = (w * w) % p;
  y = (fe_ma2 * v) % p;
  x = x + y;
  let rx = module_power((w * inverse(x)) % p, (p + 3n) / 8n);

  x = (rx * rx * (w * w - 2n * A * A * u * u)) % p;
  y = (2n * u * u + 1n - x) % p;

  let negative = false;

  if (y != 0n) {
    y = (w + x) % p;
    if (y != 0n) {
      negative = true;
    } else {
      rx = (rx * (p - 1n) * sqrt(((p - 2n) * A * (A + 2n)) % p)) % p;
      negative = false;
    }
  } else {
    rx = (rx * (p - 1n) * sqrt((2n * A * (A + 2n)) % p)) % p;
  }

  let sign;
  let z;

  if (!negative) {
    rx = (rx * u) % p;
    z = ((p - 2n) * A * u * u) % p;
    sign = 0n;
  } else {
    z = (p - 1n) * A;
    x = (x * fe_sqrtm1) % p;
    y = (w - x) % p;
    if (y != 0n) {
      rx = (rx * sqrt(((p - 1n) * fe_sqrtm1 * A * (A + 2n)) % p)) % p;
    } else {
      rx = (rx * (p - 1n) * sqrt((fe_sqrtm1 * A * (A + 2n)) % p)) % p;
    }
    sign = 1n;
  }

  if (rx % 2n != sign) {
    rx = (p - rx) % p;
  }
  let rz = (z + w) % p;
  let ry = (z + p - w) % p;
  rx = (rx * rz) % p;

  return [rx, ry, rz];
}

/**
 * @param {Uint8Array} hash
 * @returns {import("./ed25519.types").Point3}
 */
export function ge_fromfe_frombytes_vartime(hash) {
  const hashN = array_to_bigint_LE(hash);
  return hash_to_point(hashN);
}

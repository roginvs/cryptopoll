import { array_to_bigint_LE, bigint_to_array_LE } from "./bytes.mjs";

export const p = 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffedn; //2n ** 255n - 19n;

/**
 *
 * @param {bigint} x
 * @param {bigint} y
 */
export function module_power(x, y) {
  let res = 1n;
  while (y > 0n) {
    if (y % 2n === 1n) {
      res = (res * x) % p;
    }
    y = y / 2n;
    x = (x * x) % p;
  }
  return res;
}
/**
 * @param {bigint} x
 */
export function inverse(x) {
  const out = module_power(x, p - 2n);
  if ((out * x) % p !== 1n) {
    throw new Error("fail");
  }
  return out;
}

const I = module_power(2n, (p - 1n) / 4n);

/**
 * @param {bigint} x
 */

export function sqrt(x) {
  let out = module_power(x, (p + 3n) / 8n);
  const outSquare = (out * out) % p;
  if (outSquare === x) {
    // ok, nothing
  } else {
    //const minusOneSqrt = module_power(2n, (p - 1n) / 4n);
    //out = (minusOneSqrt * out) % p;
    out = (out * I) % p;
    if ((out * out) % p !== x) {
      throw new Error(`Fail: not a square root ${x}`);
    }
  }
  return out;
}

/**
 *
 * @param {import("./ed25519.types").Point} point
 */
export function ge_tobytes(point) {
  const [x, y] = to_point2(point);
  const fe_isnegative_x = x % 2n === 1n ? 1 : 0;
  const out = bigint_to_array_LE(y, 32);

  out[31] ^= fe_isnegative_x << 7;

  return out;
}

export const fe_sqrtm1 = sqrt(p - 1n);
/**
 *
 * @param {Uint8Array} bytesOriginal
 * @returns {import("./ed25519.types").Point2}
 */
export function ge_frombytes(bytesOriginal) {
  const bytes = new Uint8Array(bytesOriginal);
  const is_negative = !!(bytes[31] & (1 << 7));
  bytes[31] &= 0b01111111;
  let y = array_to_bigint_LE(bytes) % p;

  const u = (y * y + p - 1n) % p;
  const v = (d * y * y + 1n) % p;

  let x = module_power((u * inverse(v)) % p, (p + 3n) / 8n);

  let vxx = (x * x * v) % p;
  let check = (vxx + p - u) % p;

  if (check !== 0n) {
    check = (vxx + u) % p;
    if (check !== 0n) {
      throw new Error("Fail 1");
    }
    x = (x * fe_sqrtm1) % p;
  }

  if ((x % 2n === 1n) !== is_negative) {
    if (x === 0n) {
      throw new Error("Fail 2");
    }
    x = p - x;
  }
  return [x, y];
}

/** @type {import("./ed25519.types").Point2} */
const zero2 = [0n, 1n];

/** @type {import("./ed25519.types").Point3} */
const zero3 = [0n, 1n, 1n];

/** @type {import("./ed25519.types").Point4} */
const zero4 = [0n, 1n, 1n, 0n];

/**
 *
 * @param {import("./ed25519.types").Point} point
 * @returns {import("./ed25519.types").Point2}
 */
export function to_point2(point) {
  let [x, y, z] = point;
  if (z !== undefined) {
    const zInv = inverse(z);
    x = (x * zInv) % p;
    y = (y * zInv) % p;
  }
  return [x, y];
}

/**
 *
 * @param {import("./ed25519.types").Point} point
 * @returns {import("./ed25519.types").Point3}
 */
export function to_point3(point) {
  const [x, y, z] = point;
  if (z === undefined) {
    return [x, y, 1n];
  } else {
    return [x, y, z];
  }
}

/**
 *
 * @param {import("./ed25519.types").Point} point
 * @returns {import("./ed25519.types").Point4}
 */
export function to_point4(point) {
  const [x, y, z, t] = point;
  if (z !== undefined && t !== undefined) {
    return [x, y, z, t];
  }
  if (z === undefined) {
    return [x, y, 1n, (x * y) % p];
  } else {
    return [x, y, z, (x * y * inverse(z)) % p];
  }
}

const d = p - ((121665n * inverse(121666n)) % p);

/**
 *
 * @param {import("./ed25519.types").Point} p1
 * @param {import("./ed25519.types").Point} p2
 * @returns {import("./ed25519.types").Point4}
 */
export function point_add(p1, p2) {
  // https://datatracker.ietf.org/doc/html/rfc8032#section-5.1.4

  const [X1, Y1, Z1, T1] = to_point4(p1);
  const [X2, Y2, Z2, T2] = to_point4(p2);

  const A = ((Y1 + p - X1) * (Y2 + p - X2)) % p;
  const B = ((Y1 + X1) * (Y2 + X2)) % p;
  const C = (T1 * 2n * d * T2) % p;
  const D = (Z1 * 2n * Z2) % p;
  const E = (B + p - A) % p;
  const F = (D + p - C) % p;
  const G = (D + C) % p;
  const H = (B + A) % p;
  const X3 = (E * F) % p;
  const Y3 = (G * H) % p;
  const T3 = (E * H) % p;
  const Z3 = (F * G) % p;

  return [X3, Y3, Z3, T3];
}

/** @type {import("./ed25519.types").Point2}
 * Base point
 */
export const B = [
  15112221349535400772501151409588531511454012693041857206046113283949847762202n,
  46316835694926478169428394003475163141307993866256225615783033603165251855960n,
];

/** Order of points generated by base point {@see B} */
export const L = 2n ** 252n + 27742317777372353535851937790883648493n;

/**
 *
 * @param {import("./ed25519.types").Point} x
 * @param {bigint} y
 */
export function point_power(x, y) {
  let res = zero4;
  x = to_point4(x);

  while (y > 0n) {
    if (y % 2n === 1n) {
      res = point_add(res, x);
    }
    y = y / 2n;
    x = point_add(x, x);
  }

  return res;
}

/**
 *
 * @param {import("./ed25519.types").Point} point
 */
export function is_zero(point) {
  const [x, y, z, t] = point;
  if (z !== undefined) {
    return x === 0n && y === z;
  } else {
    return x === 0n && y === 1n;
  }
}

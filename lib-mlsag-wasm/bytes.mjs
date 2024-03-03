/**
 * @param {Uint8Array} bytes
 * @returns {bigint}
 */
export function array_to_bigint_LE(bytes) {
  let ret = 0n;
  const byteValues = [...bytes].reverse();
  for (const i of byteValues) {
    const bi = BigInt(i);
    ret = ret * 256n + bi;
  }
  return ret;
}

/**
 * @param {bigint} int
 * @returns {Uint8Array}
 */
export function bigint_to_array_LE(int, minLength = 0) {
  /** @type {number[]} */
  const arr = [];
  while (int > 0n) {
    const digit = int % 256n;
    int = int / 256n;
    arr.push(Number(digit));
  }

  while (arr.length < minLength) {
    arr.push(0);
  }

  return new Uint8Array(arr);
}

/**
 * @param {Uint8Array} buf
 */
export function array_to_hex(buf) {
  return new Uint8Array(buf).reduce(function (hex, byte) {
    return hex + byte.toString(16).padStart(2, "0");
  }, "");
}

/**
 *
 * @param {string} hex
 * @param {boolean} [isReversed=false]
 * @returns {Uint8Array}
 */
export function hex_to_array(hex, isReversed = false) {
  const m = hex.match(/../g);
  if (!m) {
    throw new Error(`No match!`);
  }
  const values = !isReversed ? m : [...m].reverse();
  return new Uint8Array(values.map((x) => parseInt(x, 16)));
}

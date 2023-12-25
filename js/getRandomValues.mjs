/** @type {any} */
let cryptoRef;

if (typeof crypto === "undefined") {
  cryptoRef = (await import("crypto")).webcrypto;
} else {
  cryptoRef = crypto;
}

/**
 * @param {Uint8Array} buf
 */
export function getRandomValues(buf) {
  cryptoRef.getRandomValues(buf);
}

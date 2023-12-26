import { array_to_bigint_LE, array_to_hex } from "./bytes.mjs";
import { B, ge_tobytes, point_power } from "./ed25519.mjs";
import { hex_to_key } from "./hex_to_key.mjs";
import { MLSAG_Gen, MLSAG_Ver } from "./mlsag.mjs";

/**
 * @param { string | Uint8Array } message
 * @param { (string | Uint8Array)[][] } publicKeys
 * @param {import("./ringct.types").MLSAG_Signature} signature
 */
export function MLSAG_Verify(message, publicKeys, signature) {
  const messageBuf = hex_to_key(message);
  const pk = publicKeys.map((pkk) => pkk.map((pkkk) => hex_to_key(pkkk)));

  /** @type {import("./mlsag.types").mgSig} */
  const mgSig = {
    cc: hex_to_key(signature.cc),
    II: signature.II.map((i) => hex_to_key(i)),
    ss: signature.ss.map((sss) => sss.map((ssss) => hex_to_key(ssss))),
  };

  return MLSAG_Ver(messageBuf, pk, mgSig, mgSig.II.length);
}

/**
 *
 * @param {import("./mlsag.types").Key} a
 * @param {import("./mlsag.types").Key} b
 */
export function keyEq(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  if (a.length !== 32) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

/**
 *
 * @param {string | Uint8Array} message
 * @param {(string | Uint8Array)[]} publicKeys
 * @param {(string | Uint8Array)} privateKey
 * @returns {import("./ringct.types").LSAG_Signature<Uint8Array>}
 */
export function LSAG_Sig(message, publicKeys, privateKey) {
  const msg = hex_to_key(message);
  const pk = publicKeys.map((k) => [hex_to_key(k)]);
  const privateKeyBuf = hex_to_key(privateKey);
  const myPublicKey = ge_tobytes(
    point_power(B, array_to_bigint_LE(privateKeyBuf))
  );
  const index = pk.findIndex((x) => keyEq(x[0], myPublicKey));
  if (index < 0) {
    throw new Error(`You do not have this key`);
  }
  const sig = MLSAG_Gen(msg, pk, [privateKeyBuf], index, 1);
  return {
    II: sig.II[0],
    cc: sig.cc,
    ss: sig.ss.map((s) => s[0]),
  };
}

/**
 *
 * @param {import("./ringct.types").LSAG_Signature} sig
 * @returns {import("./ringct.types").LSAG_Signature<string>}
 */
export function LSAG_Encode(sig) {
  return {
    II: array_to_hex(hex_to_key(sig.II)),
    cc: array_to_hex(hex_to_key(sig.cc)),
    ss: sig.ss.map((s) => array_to_hex(hex_to_key(s))),
  };
}

/**
 * @param { string | Uint8Array } message
 * @param { (string | Uint8Array)[] } publicKeys
 * @param {import("./ringct.types").LSAG_Signature} signature
 */
export function LSAG_Verify(message, publicKeys, signature) {
  const pk = publicKeys.map((k) => [k]);
  /** @type {import("./ringct.types").MLSAG_Signature} */
  const mlsag_sig = {
    cc: signature.cc,
    II: [signature.II],
    ss: signature.ss.map((s) => [s]),
  };
  return MLSAG_Verify(message, pk, mlsag_sig);
}

import { hex_to_array } from "./bytes.mjs";
import { MLSAG_Ver } from "./mlsag.mjs";

/**
 *
 * @param {string|undefined} s
 * @returns {import("./mlsag.types").Key}
 */
function hex_to_key(s) {
  if (!s) {
    throw new Error(`No value`);
  }
  const k = hex_to_array(s);
  if (k.length !== 32) {
    throw new Error("Wrong length");
  }
  return k;
}

/**
 *
 * @param {import("./ringct.types").SerializedMLSAGFull} sig
 */
export function MLSAG_Ver_Serialized(sig) {
  const message = hex_to_key(sig.messageHash);
  const pk = sig.publicKeys.map((pkk) => pkk.map((pkkk) => hex_to_key(pkkk)));

  /** @type {import("./mlsag.types").mgSig} */
  const mgSig = {
    cc: hex_to_key(sig.cc),
    II: sig.II.map((i) => hex_to_key(i)),
    ss: sig.ss.map((sss) => sss.map((ssss) => hex_to_key(ssss))),
  };

  return MLSAG_Ver(message, pk, mgSig, mgSig.II.length);
}

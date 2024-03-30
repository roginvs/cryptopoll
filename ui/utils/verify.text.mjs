import { array_to_hex } from "../../lib-mlsag-js/bytes.mjs";
import { LSAG_Verify } from "../../lib-mlsag-js/ringct.mjs";
import { keccak } from "../../lib-mlsag-wasm/index.mjs";
import { getMessageHash } from "./getMessageHash.mjs";
import { parsePublicKeys } from "./parsePublicKeys.mjs";

/**
 *
 * @param {boolean} what
 * @param {string} message
 */
function ensure(what, message) {
  if (!what) {
    throw new Error(message);
  }
}

/**
 * @param {string} signatureText
 * @param {string} publicKeysText
 */
export function verifySignatureText(signatureText, publicKeysText) {
  const ringPubKeys = parsePublicKeys(publicKeysText);

  if (!signatureText) {
    throw new Error(`No signed message provided`);
  }
  /** @type {import("./signedmessage.types").SignedMessage} */
  let signedMessage;
  try {
    signedMessage = JSON.parse(signatureText);
  } catch {
    throw new Error(`Malformed signed message`);
  }

  ensure(typeof signedMessage === "object", "Signed message must be an object");

  ensure(typeof signedMessage.m === "string", "No message");
  if ("mh" in signedMessage) {
    ensure(typeof signedMessage.mh === "string", "Wrong mh");
    ensure(signedMessage.mh?.length === 64, "Wrong mh length");
  }
  if ("pkh" in signedMessage) {
    ensure(typeof signedMessage.pkh === "string", "Wrong pkh");
    ensure(signedMessage.pkh?.length === 64, "Wrong pkh length");
  }
  ensure(typeof signedMessage.sig === "object", "Wrong sig property");
  ensure(typeof signedMessage.sig.II === "string", "Wrong sig.II");
  ensure(signedMessage.sig.II.length === 64, "Wrong sig.II length");
  ensure(typeof signedMessage.sig.cc === "string", "Wrong sig.II");
  ensure(signedMessage.sig.cc.length === 64, "Wrong sig.II length");
  ensure(
    typeof signedMessage.sig.ss === "object",
    "Wrong sig.ss, not an object"
  );
  ensure(Array.isArray(signedMessage.sig.ss), "Wrong sig.ss, not an array");
  ensure(
    signedMessage.sig.ss.every((x) => typeof x === "string"),
    "Wrong sig.ss element"
  );
  ensure(
    signedMessage.sig.ss.every((x) => x.length === 64),
    "Wrong sig.ss element length"
  );

  ensure(
    ringPubKeys.length === signedMessage.sig.ss.length,
    `Public keys and signed message ring differs`
  );

  const messageHash = getMessageHash(signedMessage.m);
  if ("mh" in signedMessage) {
    ensure(
      array_to_hex(messageHash) === signedMessage.mh,
      `Inconsistent message and hash`
    );
  }

  if ("pkh" in signedMessage) {
    ensure(
      array_to_hex(keccak(ringPubKeys)) === signedMessage.pkh,
      `This message was signed by another set of public keys`
    );
  }

  const verifyResult = LSAG_Verify(messageHash, ringPubKeys, signedMessage.sig);
  if (!verifyResult) {
    throw new Error(`Wrong signature`);
  }

  return signedMessage;
}

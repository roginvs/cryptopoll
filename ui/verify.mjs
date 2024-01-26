import { array_to_hex } from "../lib-mlsag-js/bytes.mjs";
import { LSAG_Verify, keccak } from "../lib-mlsag-wasm/index.mjs";
import { byId } from "./byId.mjs";
import { getMessageHash } from "./getMessageHash.mjs";
import {
  parsePublicKeys,
  ring_pub_keys_placeholder_text,
} from "./signverify.mjs";

byId("ring_pubkeys").setAttribute(
  "placeholder",
  ring_pub_keys_placeholder_text
);

const signed_message_el = /**@type {HTMLTextAreaElement} */ (
  byId("signed_message")
);
const ring_pubkeys_el = /**@type {HTMLTextAreaElement} */ (
  byId("ring_pubkeys")
);

const dialog_el = /**@type {HTMLDialogElement} */ (byId("dialog"));

const dialog_signature_status_el = byId("dialog_signature_status");
const dialog_verification_ok = byId("dialog_verification_ok");
dialog_verification_ok.style.display = "none";
const dialog_verification_fail_el = byId("dialog_verification_fail");
dialog_verification_fail_el.style.display = "none";

const dialog_signature_errortext_el = byId("dialog_signature_errortext");

const dialog_key_image_el = /**@type {HTMLInputElement} */ (
  byId("dialog_key_image")
);
const dialog_message_text_el = /**@type {HTMLTextAreaElement} */ (
  byId("dialog_message_text")
);

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

const onVerifyClick = () => {
  dialog_signature_status_el.classList.remove("dialog_signature_status_error");
  dialog_verification_fail_el.style.display = "none";
  dialog_verification_ok.style.display = "none";

  let dataAddr = 0;
  let sigAddr = 0;
  try {
    const ringPubKeys = parsePublicKeys(ring_pubkeys_el.value);

    if (!signed_message_el.value) {
      throw new Error(`No signed message provided`);
    }
    /** @type {import("./signedmessage.types").SignedMessage} */
    let signedMessage;
    try {
      signedMessage = JSON.parse(signed_message_el.value);
    } catch {
      throw new Error(`Malformed signed message`);
    }

    ensure(
      typeof signedMessage === "object",
      "Signed message must be an object"
    );

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

    const verifyResult = LSAG_Verify(
      messageHash,
      ringPubKeys,
      signedMessage.sig
    );
    if (!verifyResult) {
      throw new Error(`Wrong signature`);
    }

    dialog_signature_status_el.innerText = "Verification successfull";
    dialog_verification_ok.style.display = "";
    dialog_key_image_el.value = signedMessage.sig.II;
    dialog_message_text_el.value = signedMessage.m;
  } catch (e) {
    console.info(e);
    dialog_signature_status_el.classList.add("dialog_signature_status_error");
    dialog_signature_status_el.innerText = "Verification failed";
    dialog_verification_fail_el.style.display = "";

    dialog_signature_errortext_el.innerText =
      e instanceof Error ? e.message : `${e}`;
  }

  dialog_el.showModal();
};
byId("verify_button").addEventListener("click", onVerifyClick);
byId("dialog_button_close").addEventListener("click", () => dialog_el.close());

/*{
  // Local dev test
  signed_message_el.value =
    '{"m":"Test message","mh":"ceb871db69754f583338155828aa4ed5d9c89918bd9227275b0a71515469254a","sig":{"II":"7bc78dbe5f03cf410e4ca912ff4c669e8b66cf84b8b367778db33f631f176b55","cc":"e472b03446aa6e996ac6e8886c2fafa454338f95fab13a0012902657d80a5c0c","ss":["0245cfad63d5259caac40c2353f7493f7fb7e028c749aa70f993b54a324e0d07","f485c66e38c5818d30c806aba6debab49739a97824ab6eb1632145076eb07c03","80569803495449626da44e9a7403bebe26e3db1700b7b3cb4125ad2c4c807d06"]}}';
  ring_pubkeys_el.value = `f9a8e6bba0a5145f85efb1ee0c73373acc626f183b4c1033e5a3c4c7e1329ffc
d6610d244384c25d416058677b429e8ef991eb4550b768b75898f678b0c1b9b5
80e9fa62f672874497418fd05a96c982f2ae00fe497597047e17fce40b81b323
`;
}
*/

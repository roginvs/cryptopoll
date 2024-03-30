import { array_to_hex } from "../lib-mlsag-js/bytes.mjs";
import { hex_to_key } from "../lib-mlsag-js/hex_to_key.mjs";
import {
  LSAG_Signature,
  generatePrivateKey,
  getPublicKeyFromPrivateKey,
  keccak,
} from "../lib-mlsag-wasm/index.mjs";
import { byId } from "./byId.mjs";
import { getMessageHash } from "./utils/getMessageHash.mjs";
import { ring_pub_keys_placeholder_text } from "./signverify.mjs";
import { parsePublicKeys } from "./utils/parsePublicKeys.mjs";

/**
 * @param {Uint8Array} privateKey
 */
function startWithPrivateKey(privateKey) {
  keypair_info_el.innerHTML = "This is your public key. Share it with everyone";
  keypair_info_el.classList.add("keypair_info_ready");

  const publicKeyBuf = getPublicKeyFromPrivateKey(privateKey);
  public_key_el.innerText = array_to_hex(publicKeyBuf);

  const message_el = /** @type {HTMLTextAreaElement} */ (byId("message"));
  const ring_pub_keys_el = /** @type {HTMLTextAreaElement} */ (
    byId("ring_pubkeys")
  );
  message_el.removeAttribute("disabled");
  message_el.setAttribute("placeholder", "Type a message here");
  ring_pub_keys_el.removeAttribute("disabled");
  ring_pub_keys_el.setAttribute("placeholder", ring_pub_keys_placeholder_text);

  const sign_button_el = byId("sign_button");
  sign_button_el.removeAttribute("disabled");

  {
    // Local testing
    /*
    message_el.value = "Test message";
    ring_pub_keys_el.value = [
      "f9a8e6bba0a5145f85efb1ee0c73373acc626f183b4c1033e5a3c4c7e1329ffc",
      "d6610d244384c25d416058677b429e8ef991eb4550b768b75898f678b0c1b9b5",
      "80e9fa62f672874497418fd05a96c982f2ae00fe497597047e17fce40b81b323",
    ]
      .map((x) => x + "\n")
      .join("");
      */
  }

  const dialog_el = /** @type {HTMLDialogElement} */ (byId("dialog"));

  byId("dialog_button_close").addEventListener("click", () => {
    dialog_el.close();
  });

  const dialog_signature_status_el = byId("dialog_signature_status");
  const dialog_signature_text_el = /** @type {HTMLTextAreaElement} */ (
    byId("dialog_signature_text")
  );
  const onSignClick = () => {
    dialog_signature_status_el.classList.remove(
      "dialog_signature_status_error"
    );

    try {
      const ringPubKeys = parsePublicKeys(ring_pub_keys_el.value);

      if (
        !ringPubKeys
          .map((x) => array_to_hex(x))
          .includes(array_to_hex(publicKeyBuf))
      ) {
        // Double-check before even calling wasm
        throw new Error(`Your public key is not included into the list`);
      }

      const message = message_el.value;

      const messageHash = getMessageHash(message);

      const sig = LSAG_Signature(messageHash, privateKey, ringPubKeys);

      /** @type {import("./signedmessage.types").SignedMessage} */
      const signedMessage = {
        m: message,
        mh: array_to_hex(messageHash),
        pkh: array_to_hex(keccak(ringPubKeys)),
        sig,
      };

      dialog_signature_text_el.value = JSON.stringify(signedMessage);

      dialog_signature_status_el.innerText = `Signing successfull with a ring of ${ringPubKeys.length} participants`;
    } catch (e) {
      dialog_signature_status_el.classList.add("dialog_signature_status_error");
      dialog_signature_status_el.innerText = "Signing failed";
      dialog_signature_text_el.value = e instanceof Error ? e.message : `${e}`;
    }
    dialog_el.showModal();
  };

  sign_button_el.addEventListener("click", onSignClick);

  public_key_options_el.style.display = "";
  public_key_options_el.addEventListener("click", () => {
    if (!confirm("Do you want to logout?")) {
      return;
    }
    if (
      !confirm(
        "Your private key will be remove and there will be no way to recover it. Are you sure?"
      )
    ) {
      return;
    }
    localStorage.removeItem(LOCALSTORAGE_PRIV_KEY_KEY);
    window.location.reload();
  });
}

const LOCALSTORAGE_PRIV_KEY_KEY = "private-key";

const public_key_el = byId("public_key");
const public_key_options_el = byId("public_key_options");
const keypair_info_el = byId("keypair_info");

function start() {
  const savedKey = localStorage.getItem(LOCALSTORAGE_PRIV_KEY_KEY);
  if (!savedKey) {
    return;
  }
  const keyBuf = hex_to_key(savedKey);
  startWithPrivateKey(keyBuf);
}

async function startGeneratePrivateKey() {
  keypair_info_el.innerText = "Generating...";
  for (let i = 0; i < 64; i++) {
    public_key_el.innerText = "*".repeat(i + 1) + "-".repeat(64 - i - 1);
    await new Promise((r) => setTimeout(r, 20));
  }
  const privateKeyBuf = generatePrivateKey();

  keypair_info_el.innerText = "Saving...";
  await new Promise((r) => setTimeout(r, 1000));
  localStorage.setItem(LOCALSTORAGE_PRIV_KEY_KEY, array_to_hex(privateKeyBuf));
  startWithPrivateKey(privateKeyBuf);
}

byId("generate_keypair").addEventListener("click", (e) => {
  e.preventDefault();
  startGeneratePrivateKey();
});

start();

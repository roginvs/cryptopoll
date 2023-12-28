import { array_to_hex } from "../lib-mlsag-js/bytes.mjs";
import { hex_to_key } from "../lib-mlsag-js/hex_to_key.mjs";
import { memoryView, wasm } from "../lib-mlsag-wasm/index.mjs";
import { byId } from "./byId.mjs";

/**
 * @param {Uint8Array} privateKey
 */
function startWithPrivateKey(privateKey) {
  keypair_info_el.innerHTML = "This is your public key";
  keypair_info_el.classList.add("keypair_info_ready");

  const publicKeyBuf = (() => {
    const addr = wasm.allocate_keys(2);
    memoryView.set(privateKey, addr);
    wasm.scalarmultBase(addr + 32, addr);
    const buf = new Uint8Array(32);
    buf.set(memoryView.subarray(addr + 32, addr + 32 + 32));
    memoryView.set(new Uint8Array(64), addr);
    wasm.free_keys(addr);
    return buf;
  })();
  public_key_el.innerText = array_to_hex(publicKeyBuf);

  const message_el = /** @type {HTMLTextAreaElement} */ (byId("message"));
  const ring_pub_keys_el = /** @type {HTMLTextAreaElement} */ (
    byId("ring_pubkeys")
  );
  message_el.removeAttribute("disabled");
  message_el.setAttribute("placeholder", "Type a message here");
  ring_pub_keys_el.removeAttribute("disabled");
  ring_pub_keys_el.setAttribute(
    "placeholder",
    "Here is a list of all participants public keys"
  );

  const sign_button_el = byId("sign_button");
  sign_button_el.removeAttribute("disabled");

  {
    // Local testing
    message_el.value = "Test message";
    ring_pub_keys_el.value = [
      "f9a8e6bba0a5145f85efb1ee0c73373acc626f183b4c1033e5a3c4c7e1329ffc",
      "d6610d244384c25d416058677b429e8ef991eb4550b768b75898f678b0c1b9b5",
      "80e9fa62f672874497418fd05a96c982f2ae00fe497597047e17fce40b81b323",
    ]
      .map((x) => x + "\n")
      .join("");
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
      /** @type {Uint8Array[]} */
      const ringPubKeys = [];
      for (const str of ring_pub_keys_el.value
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x)) {
        try {
          const buf = hex_to_key(str);
          ringPubKeys.push(buf);
        } catch {
          throw new Error(`Failed to read public key: ${str}`);
        }
      }

      //

      dialog_signature_status_el.innerText = "Signing successfull";
    } catch (e) {
      dialog_signature_status_el.classList.add("dialog_signature_status_error");
      dialog_signature_status_el.innerText = "Signing failed";
      dialog_signature_text_el.innerText =
        e instanceof Error ? e.message : `${e}`;
    } finally {
      //
    }

    dialog_el.showModal();
  };

  sign_button_el.addEventListener("click", onSignClick);
  // TODO: This is onclick
  onSignClick();
}

const LOCALSTORAGE_PRIV_KEY_KEY = "private-key";

const public_key_el = byId("public_key");
const keypair_info_el = byId("keypair_info");

function start() {
  const savedKey = localStorage.getItem(LOCALSTORAGE_PRIV_KEY_KEY);
  if (!savedKey) {
    return;
  }
  const keyBuf = hex_to_key(savedKey);
  startWithPrivateKey(keyBuf);
}

async function generatePrivateKey() {
  keypair_info_el.innerText = "Generating...";
  for (let i = 0; i < 64; i++) {
    public_key_el.innerText = "*".repeat(i + 1) + "-".repeat(64 - i - 1);
    await new Promise((r) => setTimeout(r, 20));
  }
  const privateKeyBuf = (() => {
    const addr = wasm.allocate_keys(1);
    wasm.skGen(addr);
    const buf = new Uint8Array(32);
    buf.set(memoryView.subarray(addr, addr + 32));
    memoryView.set(new Uint8Array(32).fill(0), addr);
    wasm.free_keys(addr);
    return buf;
  })();
  keypair_info_el.innerText = "Saving...";
  await new Promise((r) => setTimeout(r, 1000));
  localStorage.setItem(LOCALSTORAGE_PRIV_KEY_KEY, array_to_hex(privateKeyBuf));
  startWithPrivateKey(privateKeyBuf);
}

byId("generate_keypair").addEventListener("click", (e) => {
  e.preventDefault();
  generatePrivateKey();
});

start();

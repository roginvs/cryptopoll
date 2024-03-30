import { byId } from "./byId.mjs";
import { ring_pub_keys_placeholder_text } from "./signverify.mjs";
import { verifySignatureText } from "./utils/verify.text.mjs";

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

const onVerifyClick = () => {
  dialog_signature_status_el.classList.remove("dialog_signature_status_error");
  dialog_verification_fail_el.style.display = "none";
  dialog_verification_ok.style.display = "none";

  try {
    const signedMessage = verifySignatureText(
      signed_message_el.value,
      ring_pubkeys_el.value
    );

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

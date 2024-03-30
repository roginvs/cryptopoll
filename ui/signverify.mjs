export const ring_pub_keys_placeholder_text =
  "# Here is a list of all participants public keys\n" +
  "# Empty lines and lines starting with # are ignored\n" +
  "# Example with 4 public keys:\n\n" +
  "d6610d244384c25d416058677b429e8ef991eb4550b768b75898f678b0c1b9b5\n\n" +
  "66866748a34b50e52197ebc9dce8ef82e9223ed0685e6efbeb816071640bca27\n\n" +
  "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFcm0CozMlc6qwqR8P0mWV+A/uoeZYMXUVRkiBo0ugZj\n\n" +
  "AAAAC3NzaC1lZDI1NTE5AAAAIPmj4NfVFZBaGLXSuySp8z1Im4TyX/wZ/WoZBaaijR8v\n\n";

document.querySelectorAll("#dialog textarea, #dialog input").forEach((el) => {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    el.addEventListener("touchend", () => {
      el.selectionStart = 0;
      el.selectionEnd = el.value.length;
    });
  }
});

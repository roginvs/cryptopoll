export const ring_pub_keys_placeholder_text =
  "# Here is a list of all participants public keys\n" +
  "# Empty lines and lines starting with # are ignored\n" +
  "# Example:\n\n" +
  "# Vasilii\naabbcc.....\n\n" +
  "# Mariia\neeffdd.....\n";

document.querySelectorAll("#dialog textarea, #dialog input").forEach((el) => {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    el.addEventListener("touchend", () => {
      el.selectionStart = 0;
      el.selectionEnd = el.value.length;
    });
  }
});

/**
 * @param {string} s
 */
export function base64tobuf(s) {
  // Contains symbols with codes 0x00 to 0xFF
  const bufStr = atob(s);
  const buf = new Uint8Array([...bufStr].map((c) => c.charCodeAt(0)));

  return buf;
}

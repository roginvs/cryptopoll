const magicString = "ssh-ed25519";
const base64magicWithLenPrefix = "AAAAC3NzaC1lZDI1NTE5";

/** @param {string} s  */
export function is_ssh_ed25519_public_key(s) {
  return s.startsWith(magicString) || s.startsWith(base64magicWithLenPrefix);
}

/**
 * @param {string} s
 */
function base64tobuf(s) {
  // Contains symbols with codes 0x00 to 0xFF
  const bufStr = atob(s);
  const buf = new Uint8Array([...bufStr].map((c) => c.charCodeAt(0)));

  return buf;
}

/**
 * @param {string} s
 */
function get_public_key_buf_from_ssh_ed25519_public_key_base64(s) {
  const buf = base64tobuf(s);
  const prefixBuf = base64tobuf(base64magicWithLenPrefix);
  if (buf.length !== prefixBuf.length + 4 + 0x20) {
    throw new Error("Wrong length");
  }

  if (
    buf[prefixBuf.length + 0] !== 0 ||
    buf[prefixBuf.length + 1] !== 0 ||
    buf[prefixBuf.length + 2] !== 0 ||
    buf[prefixBuf.length + 3] !== 0x20
  ) {
    throw new Error("Wrong length part");
  }

  return buf.subarray(prefixBuf.length + 4);
}

/**
 * @param {string} s
 */
export function get_public_key_buf_from_ssh_ed25519_public_key(s) {
  if (!is_ssh_ed25519_public_key) {
    throw new Error(`Not a ssh ed25519 public key`);
  }
  if (s.startsWith(magicString)) {
    const base64 = s.split(/\s+/)[1];
    if (!base64) {
      throw new Error("Not a ssh ed25519 public key, no base64 part");
    }
    return get_public_key_buf_from_ssh_ed25519_public_key_base64(base64);
  } else if (s.startsWith(base64magicWithLenPrefix)) {
    const base64 = s.split(/\s+/)[0];
    return get_public_key_buf_from_ssh_ed25519_public_key_base64(base64);
  } else {
    throw new Error("Not a ssh ed25519 public key");
  }
}

/**
 * @param {Uint8Array} buf
 */
export function endcode_public_key(buf) {
  if (buf.length !== 0x20) {
    throw new Error(`Not a ed25519 key`);
  }
  return (
    magicString +
    " " +
    base64magicWithLenPrefix +
    btoa(String.fromCharCode(0x0, 0x0, 0x0, 0x20, ...buf))
  );
}

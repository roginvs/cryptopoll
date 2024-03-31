/**
 * @param {Uint8Array} secret
 */
export async function ed25519_secret_to_privatekey(secret) {
  if (secret.length !== 0x20) {
    throw new Error(`Wrong secret length`);
  }

  const hash = await crypto.subtle.digest("SHA-512", secret);

  const privateKey = new Uint8Array(hash.slice(0, 0x20));
  // https://datatracker.ietf.org/doc/html/rfc8032#section-5.1.5
  privateKey[0] &= 0b11111000;
  privateKey[31] &= 0b00111111;
  privateKey[31] |= 0b01000000;
  return privateKey;
}

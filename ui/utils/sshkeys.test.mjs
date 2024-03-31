import assert from "assert";
import {
  decode_ssh_privatekey,
  endcode_public_key,
  get_public_key_buf_from_ssh_ed25519_public_key,
} from "./sshkeys.mjs";
import { describe, it } from "node:test";
import { array_to_hex } from "../../lib-mlsag-js/bytes.mjs";

describe("get_public_key_buf_from_ssh_ed25519_public_key", function () {
  it("should return public key for valid SSH public key", function () {
    const validKey =
      "ssh-ed25519  AAAAC3NzaC1lZDI1NTE5AAAAIPmj4NfVFZBaGLXSuySp8z1Im4TyX/wZ/WoZBaaijR8v vasilii";

    assert.strictEqual(
      array_to_hex(get_public_key_buf_from_ssh_ed25519_public_key(validKey)),
      "f9a3e0d7d515905a18b5d2bb24a9f33d489b84f25ffc19fd6a1905a6a28d1f2f"
    );
  });

  it("should return public key for valid SSH public key with no prefix", function () {
    const validKey =
      "AAAAC3NzaC1lZDI1NTE5AAAAIPmj4NfVFZBaGLXSuySp8z1Im4TyX/wZ/WoZBaaijR8v vasilii";

    assert.strictEqual(
      array_to_hex(get_public_key_buf_from_ssh_ed25519_public_key(validKey)),
      "f9a3e0d7d515905a18b5d2bb24a9f33d489b84f25ffc19fd6a1905a6a28d1f2f"
    );
  });

  it(`should throw on non ed25519 ssh public key`, () => {
    assert.throws(() =>
      get_public_key_buf_from_ssh_ed25519_public_key("ssh-rsa asdasd")
    );
  });
});

describe(`endcode_public_key`, () => {
  it("encodes correctly", function () {
    const validKey =
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPmj4NfVFZBaGLXSuySp8z1Im4TyX/wZ/WoZBaaijR8v";

    assert.strictEqual(
      endcode_public_key(
        get_public_key_buf_from_ssh_ed25519_public_key(validKey)
      ),
      validKey
    );
  });
});

describe(`decode_ssh_privatekey secret`, () => {
  const keyStr = `
    -----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACD5o+DX1RWQWhi10rskqfM9SJuE8l/8Gf1qGQWmoo0fLwAAAJj7TkVd+05F
XQAAAAtzc2gtZWQyNTUxOQAAACD5o+DX1RWQWhi10rskqfM9SJuE8l/8Gf1qGQWmoo0fLw
AAAEAsyvrtgqL3xHsbR6N0l2OigSW3ABG/dkf85vT4brSi/fmj4NfVFZBaGLXSuySp8z1I
m4TyX/wZ/WoZBaaijR8vAAAADnZhc2lsaWlAY2FyYm9uAQIDBAUGBw==
-----END OPENSSH PRIVATE KEY-----

    `;
  assert.deepStrictEqual(
    decode_ssh_privatekey(keyStr),
    new Uint8Array([
      44, 202, 250, 237, 130, 162, 247, 196, 123, 27, 71, 163, 116, 151, 99,
      162, 129, 37, 183, 0, 17, 191, 118, 71, 252, 230, 244, 248, 110, 180, 162,
      253,
    ])
  );
});

import assert from "assert";
import {
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

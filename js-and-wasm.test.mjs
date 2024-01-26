import test from "node:test";
import { memoryView, wasm } from "./lib-mlsag-wasm/index.mjs";
import * as libMlsagJs from "./lib-mlsag-js/ringct.mjs";
import assert from "node:assert";
import {
  LSAG_Signature,
  LSAG_Verify,
  generatePrivateKey,
  getPublicKeyFromPrivateKey,
} from "./lib-mlsag-wasm/funcs.mjs";

for (const keyLen of [3, 4, 5]) {
  for (const index of new Array(keyLen).fill(0).map((_, i) => i)) {
    test(`wasm sign, js check keyLen=${keyLen} index=${index}`, () => {
      const keyLen = 4;
      const index = 2;

      const message = generatePrivateKey();

      const privateKeys = new Array(keyLen)
        .fill(0)
        .map(() => generatePrivateKey());
      const publicKeys = privateKeys.map((key) =>
        getPublicKeyFromPrivateKey(key)
      );

      const sig = LSAG_Signature(message, privateKeys[index], publicKeys);

      const result = libMlsagJs.LSAG_Verify(message, publicKeys, sig);

      assert.strictEqual(result, true);

      assert.ok(LSAG_Verify(message, publicKeys, sig));
      assert.ok(!LSAG_Verify(new Uint8Array(32).fill(0), publicKeys, sig));
    });
  }
}

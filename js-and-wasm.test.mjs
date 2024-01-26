import test from "node:test";
import { memoryView, wasm } from "./lib-mlsag-wasm/index.mjs";
import { LSAG_Verify } from "./lib-mlsag-js/ringct.mjs";
import assert from "node:assert";
import { array_to_hex, hex_to_array } from "./lib-mlsag-js/bytes.mjs";

for (const keyLen of [3, 4, 5]) {
  for (const index of new Array(keyLen).fill(0).map((_, i) => i)) {
    test(`wasm sign, js check keyLen=${keyLen} index=${index}`, () => {
      const keyLen = 4;
      const index = 2;

      const pubkeysAddrs = wasm.allocate_keys(keyLen);

      const messageAddr = wasm.allocate_keys(1);
      wasm.skGen(messageAddr);

      const privAddr = wasm.allocate_keys(keyLen);

      for (let i = 0; i < keyLen; i++) {
        wasm.skGen(privAddr + i * 32);
        wasm.scalarmultBase(pubkeysAddrs + i * 32, privAddr + i * 32);
      }

      const sigAddr = wasm.LSAG_Signature(
        messageAddr,
        privAddr + index * 32,
        keyLen,
        pubkeysAddrs
      );

      assert.notStrictEqual(sigAddr, 0);

      const result = LSAG_Verify(
        memoryView.subarray(messageAddr, messageAddr + 32),
        new Array(keyLen)
          .fill(0)
          .map((_, i) =>
            memoryView.subarray(
              pubkeysAddrs + i * 32,
              pubkeysAddrs + i * 32 + 32
            )
          ),
        {
          II: memoryView.subarray(sigAddr, sigAddr + 32),
          cc: memoryView.subarray(sigAddr + 32, sigAddr + 32 + 32),
          ss: new Array(keyLen)
            .fill(0)
            .map((_, i) =>
              memoryView.subarray(
                sigAddr + 32 + 32 + i * 32,
                sigAddr + 32 + 32 + i * 32 + 32
              )
            ),
        }
      );

      assert.strictEqual(result, true);

      assert.ok(wasm.LSAG_Verify(messageAddr, keyLen, pubkeysAddrs, sigAddr));
      assert.ok(
        !wasm.LSAG_Verify(messageAddr + 1, keyLen, pubkeysAddrs, sigAddr)
      );

      wasm.free_keys(sigAddr);
      wasm.free_keys(pubkeysAddrs);
      wasm.free_keys(privAddr);
      wasm.free_keys(messageAddr);
    });
  }
}

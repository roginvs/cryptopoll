import test from "node:test";
import { memoryView, wasm } from "./lib-mlsag-wasm/index.mjs";
import { LSAG_Verify } from "./lib-mlsag-js/ringct.mjs";
import assert from "node:assert";

test("wasm sign, js check", () => {
  const keyLen = 4;
  const index = 2;

  const dataAddr = wasm.allocate_keys(keyLen + 2);
  // Generate random message
  wasm.skGen(dataAddr);

  const privAddr = wasm.allocate_keys(keyLen);

  for (let i = 0; i < keyLen; i++) {
    wasm.skGen(privAddr + i * 32);
    wasm.scalarmultBase(dataAddr + 32 + 32 + i * 32, privAddr + i * 32);
  }

  // Copy private key into data for wasm call
  memoryView.set(
    memoryView.subarray(privAddr + index * 32, privAddr + index * 32 + 32),
    dataAddr + 32
  );

  const sigAddr = wasm.LSAG_Signature(keyLen, dataAddr);

  const result = LSAG_Verify(
    memoryView.subarray(dataAddr, dataAddr + 32),
    new Array(keyLen)
      .fill(0)
      .map((_, i) =>
        memoryView.subarray(
          dataAddr + 32 + 32 + i * 32,
          dataAddr + 32 + 32 + i * 32 + 32
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

  wasm.free_keys(sigAddr);
  wasm.free_keys(dataAddr);
  wasm.free_keys(privAddr);
});

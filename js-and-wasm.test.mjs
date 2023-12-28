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

test("hash", () => {
  const parts = [
    "f4f513062294361ec5def418b771c57748b63d91cd5937f4d3f1c11eb3fcdc0c",
    "0a0674ba2aac76e9469f7845675c09d1c3e415c90bd342d67e29644440424e04",
    "051f9b4b7cd6d912670c9ad5890ce2ae3370fc245fc2d692399ea040275b5d08",
    "00385f5d1e0ec7cd71e24f14b044f031483565987bcfa74aa325a6def5b11f03",
    "0725beab97c8777d24e05388745e58931894231763a67a62da4c5c43f1966604",
    "2f4f256704242c154673b53ef36a5ab4125942f41f02176fb245d43067baed0b",
    "8cbd7fb9a70876db630eaeb27c120e52e1e20b80048bad989d1b884044251f0f",
    "0e2a59178582165663bfe8eea001a4da2832c8cc52f41a9910d2b8af5771520d",
    "1860c19616dd102fdbee8540beaa295ad13ed3bb731135dafc7e252fc75d9102",
    "29bc9edd1e22f0a2ab6a124d5f2aab43f3f959d2c736dcf852ef067278da3a01",
  ];

  const addr = wasm.allocate_keys(parts.length + 1);

  memoryView.set(hex_to_array(parts.join("")), addr + 32);
  wasm.cn_fast_hash(addr, addr + 32, parts.length * 32);

  const outHex = array_to_hex(memoryView.subarray(addr, addr + 32));
  assert.strictEqual(
    outHex,
    "fd19cafbfbdd2ff63236c744c410796306c12e02083b58da99203c54ced55e71"
  );
});

import test from "node:test";
import assert from "node:assert";
import { hex_to_key } from "../lib-mlsag-js/hex_to_key.mjs";
import { getKeysHash, getMessageHash } from "./getMessageHash.mjs";
import { array_to_hex } from "../lib-mlsag-js/bytes.mjs";

test("getKeysHash", () => {
  const keys = [
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
  ].map((p) => hex_to_key(p));

  const outHex = array_to_hex(getKeysHash(keys));
  assert.strictEqual(
    outHex,
    "fd19cafbfbdd2ff63236c744c410796306c12e02083b58da99203c54ced55e71"
  );
});

test("getMessageHash", () => {
  assert.strictEqual(
    array_to_hex(getMessageHash("кек")),
    "4b90a03434aef006f44d3941834dbd0554d1ebeaffc7cf055b13c1f3983283ac"
  );
});

test("getMessageHash", () => {
  assert.strictEqual(
    array_to_hex(
      getMessageHash(
        "4b90a03434aef006f44d3941834dbd0554d1ebeaffc7cf055b13c1f3983283ac----22222"
      )
    ),
    "35f4740662a38fd07bf25897af0e02377c5e0e8ae11849da6df33e67d7c8b6bb"
  );
});

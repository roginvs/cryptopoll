import test from "node:test";
import { memoryView, wasm } from "./index.mjs";
import assert from "node:assert";
import { array_to_hex, hex_to_array } from "../lib-mlsag-js/bytes.mjs";
import { getPublicKeyFromPrivateKey, keccak } from "./funcs.mjs";

test("Wasm library", () => {
  const privateKey = [
    18, 88, 30, 112, 161, 146, 174, 185, 172, 20, 17, 179, 109, 17, 252, 6, 57,
    61, 181, 89, 152, 25, 4, 145, 192, 99, 128, 122, 107, 77, 115, 13,
  ];
  const publicKeyExpected = [
    20, 227, 82, 9, 147, 109, 229, 151, 16, 228, 163, 165, 91, 24, 135, 166,
    243, 163, 144, 192, 177, 178, 209, 50, 160, 21, 143, 243, 182, 5, 129, 224,
  ];

  assert.strictEqual(
    array_to_hex(getPublicKeyFromPrivateKey(new Uint8Array(privateKey))),
    array_to_hex(new Uint8Array(publicKeyExpected))
  );
});

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

const outHexExpected =
  "fd19cafbfbdd2ff63236c744c410796306c12e02083b58da99203c54ced55e71";

test("hash by each part", () =>
  assert.strictEqual(
    array_to_hex(keccak(parts.map((part) => hex_to_array(part)))),
    outHexExpected
  ));

test("hash all together", () =>
  assert.strictEqual(
    array_to_hex(keccak(hex_to_array(parts.join("")))),
    outHexExpected
  ));

test("hash by 2 pieces", () =>
  assert.strictEqual(
    array_to_hex(
      keccak(
        [parts.slice(0, 7).join(""), parts.slice(7).join("")].map((part) =>
          hex_to_array(part)
        )
      )
    ),
    outHexExpected
  ));

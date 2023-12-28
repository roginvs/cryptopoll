import test from "node:test";
import { array_to_hex, hex_to_array } from "./bytes.mjs";
import { Keccak } from "./keccak.mjs";
import assert from "node:assert";

test("Empty", () => {
  assert.strictEqual(
    array_to_hex(Keccak.keccak256(new Uint8Array([]))),
    "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
  );
});

test("Sample string", () => {
  assert.strictEqual(
    array_to_hex(
      Keccak.keccak256(
        hex_to_array(
          "610d3d69deb94f51dae6e535b88482b5e7e6fab6a89913a8344b273a9f2c1b08"
        )
      )
    ),
    "0b78ab4ef4ab57f34256d31bcf0d62b726c1319a1d789367173bba9b96975ca2"
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
const partsResult =
  "fd19cafbfbdd2ff63236c744c410796306c12e02083b58da99203c54ced55e71";

test("Long data", () => {
  assert.strictEqual(
    array_to_hex(Keccak.keccak256(hex_to_array(parts.join("")))),
    partsResult
  );
});

test("Long data by parts", () => {
  const hash = new Keccak();
  for (const part of parts) {
    hash.update(hex_to_array(part));
  }
  assert.strictEqual(array_to_hex(hash.digest()), partsResult);
});

test("Test message", () => {
  const h = Keccak.keccak256(Buffer.from("Test message"));
  assert.strictEqual(
    array_to_hex(h),
    "ceb871db69754f583338155828aa4ed5d9c89918bd9227275b0a71515469254a"
  );
});

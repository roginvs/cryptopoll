import fs from "fs";
import test from "node:test";
import { array_to_bigint_LE, array_to_hex, hex_to_array } from "./bytes.mjs";
import { ge_fromfe_frombytes_vartime, hash_to_point } from "./hash_to_point.mjs";
import { ge_tobytes } from "./ed25519.mjs";
import assert from "node:assert";

const lines = fs
  .readFileSync("./hash_to_point.testdata.txt")
  .toString()
  .split("\n")
  .filter((x) => x);

for (const line of lines) {
  const [func, hashHex, pointHexExpected] = line.split(" ");
  test(`hash ${hashHex}`, () => {
    const hash = array_to_bigint_LE(hex_to_array(hashHex));
    const point = hash_to_point(hash);
    const pointHex = array_to_hex(ge_tobytes(point));
    assert.strictEqual(pointHex, pointHexExpected);
  });
}

test("ge_fromfe_frombytes_vartime", () => {
  const hash = hex_to_array("fc52a43c08a46e869ddadef1e1c6512d8c5b9e278247f1cc325850a311263603");
  const point = ge_fromfe_frombytes_vartime(hash);
  const pointHex = array_to_hex(ge_tobytes(point));
  assert.strictEqual(pointHex, "9198cf6ccd1cf19110eca3bc9a6c090361ec4f59c9c429e0fc822d70e100f0d2");
});

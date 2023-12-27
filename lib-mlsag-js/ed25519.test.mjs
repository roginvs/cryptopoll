import test from "node:test";
import {
  B,
  L,
  ge_frombytes,
  ge_tobytes,
  is_zero,
  point_power,
  to_point2,
} from "./ed25519.mjs";
import assert from "node:assert";
import { array_to_bigint_LE, array_to_hex, hex_to_array } from "./bytes.mjs";
import * as fs from "fs";

test("B", () => {
  assert.ok(!is_zero(B));

  assert.strictEqual(
    array_to_hex(ge_tobytes(point_power(B, 2n))),
    "c9a3f86aae465f0e56513864510f3997561fa2c9e85ea21dc2292309f3cd6022"
  );

  assert.strictEqual(
    array_to_hex(ge_tobytes(point_power(B, 5n))),
    "edc876d6831fd2105d0b4389ca2e283166469289146e2ce06faefe98b22548df"
  );

  assert.strictEqual(
    array_to_hex(
      ge_tobytes(
        point_power(
          B,
          array_to_bigint_LE(
            hex_to_array(
              "12581e70a192aeb9ac1411b36d11fc06393db55998190491c063807a6b4d730d"
            )
          )
        )
      )
    ),
    "14e35209936de59710e4a3a55b1887a6f3a390c0b1b2d132a0158ff3b60581e0"
  );

  assert.ok(is_zero(point_power(B, L)));
});

/** @param {string} encoded  */
function check_ge_frombytes(encoded) {
  test(`${encoded}`, () => {
    assert.strictEqual(
      array_to_hex(ge_tobytes(ge_frombytes(hex_to_array(encoded)))),

      encoded
    );
  });
}

check_ge_frombytes(
  "edc876d6831fd2105d0b4389ca2e283166469289146e2ce06faefe98b22548df"
);

for (const encodedPoint of fs
  .readFileSync(new URL("./ed25519.ge_frombytes.testdata.txt", import.meta.url))
  .toString()
  .split("\n")
  .map((x) => x.trim())
  .filter((x) => x)) {
  check_ge_frombytes(encodedPoint);
}

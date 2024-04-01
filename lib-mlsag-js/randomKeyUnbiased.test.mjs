import { describe, it } from "node:test";
import { randomKeyUnbiased } from "./randomKeyUnbiased.mjs";
import assert from "node:assert";
import { array_to_bigint_LE } from "./bytes.mjs";
import { L } from "./ed25519.mjs";

describe(`randomKeyUnbiased`, () => {
  it(`should return a random key`, () => {
    for (let i = 0; i < 1000; i++) {
      const key = randomKeyUnbiased();
      assert.strictEqual(key.length, 32);

      const n = array_to_bigint_LE(key);
      assert(0n < n);
      assert(n < L);
    }
  });
});

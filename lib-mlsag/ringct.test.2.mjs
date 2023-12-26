import fs from "fs";
import test from "node:test";
import assert from "node:assert";
import { LSAG_Encode, LSAG_Sig, LSAG_Verify, MLSAG_Verify } from "./ringct.mjs";
import { getRandomValues } from "./getRandomValues.mjs";
import { B, ge_tobytes, point_power } from "./ed25519.mjs";
import { array_to_bigint_LE } from "./bytes.mjs";

test("LSAG", () => {
  const M = 8;
  const index = 3;

  const privateKeys = new Array(M).fill(0).map(() => {
    const b = new Uint8Array(32);
    getRandomValues(b);
    return b;
  });
  const publicKeys = privateKeys.map((k) =>
    ge_tobytes(point_power(B, array_to_bigint_LE(k)))
  );

  const message = new Uint8Array(32);
  getRandomValues(message);

  const sig = LSAG_Encode(LSAG_Sig(message, publicKeys, privateKeys[index]));

  assert.ok(LSAG_Verify(message, publicKeys, sig));
});

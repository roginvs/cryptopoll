import test from "node:test";
import { array_to_bigint_LE, hex_to_array } from "./bytes.mjs";
import { MLSAG_Ver, MLSAG_Gen } from "./mlsag.mjs";
import assert from "node:assert";
import { B, ge_frombytes, ge_tobytes, point_power } from "./ed25519.mjs";
import { getRandomValues } from "./getRandomValues.mjs";

for (const cols of [2, 3, 4]) {
  for (const index of new Array(cols).fill(0).map((_, i) => i)) {
    for (const rows of [1, 2, 3]) {
      for (const dsRows of new Array(rows).fill(0).map((_, i) => i)) {
        test(`MLSAG_Gen cols=${cols} index=${index} rows=${rows} dsRows=${rows}`, () => {
          const message = new Uint8Array(32);
          getRandomValues(message);

          const allPrivateKeys = new Array(cols).fill([]).map(() =>
            new Array(rows).fill(new Uint8Array(0)).map(() => {
              const x = new Uint8Array(32);
              getRandomValues(x);
              return x;
            })
          );
          const allPublicKeys = allPrivateKeys.map((vec) =>
            vec.map((pk) => {
              return ge_tobytes(point_power(B, array_to_bigint_LE(pk)));
            })
          );

          const xx = allPrivateKeys[index];

          const sig = MLSAG_Gen(message, allPublicKeys, xx, index, dsRows);

          assert.ok(MLSAG_Ver(message, allPublicKeys, sig, dsRows));
        });
      }
    }
  }
}

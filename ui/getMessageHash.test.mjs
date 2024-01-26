import test from "node:test";
import assert from "node:assert";
import { getMessageHash } from "./getMessageHash.mjs";
import { array_to_hex } from "../lib-mlsag-js/bytes.mjs";

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

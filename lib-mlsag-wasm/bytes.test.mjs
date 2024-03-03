import assert from "node:assert";
import { test } from "node:test";
import { array_to_hex, bigint_to_array_LE, array_to_bigint_LE, hex_to_array } from "./bytes.mjs";

test("bytes_to_bigint", () => {
  assert.strictEqual(
    array_to_bigint_LE(
      new Uint8Array(
        Buffer.from("83efb774657700e37291f4b8dd10c839d1c739fd135c07a2fd7382334dafdd6a", "hex"),
      ),
    ),
    0x6addaf4d338273fda2075c13fd39c7d139c810ddb8f49172e300776574b7ef83n,
  );
});

test("bigint_to_bytes", () => {
  assert.strictEqual(
    Buffer.from(
      bigint_to_array_LE(0x6addaf4d338273fda2075c13fd39c7d139c810ddb8f49172e300776574b7ef83n),
    ).toString("hex"),
    "83efb774657700e37291f4b8dd10c839d1c739fd135c07a2fd7382334dafdd6a",
  );
});

test("array_to_hex", () => {
  assert.strictEqual(array_to_hex(Buffer.from("03aa05bb", "hex")), "03aa05bb");
});

test("hex_to_array", () => {
  assert.strictEqual(Buffer.from(hex_to_array("03aa05bb")).toString("hex"), "03aa05bb");
});

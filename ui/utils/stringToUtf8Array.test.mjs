import test from "node:test";
import { stringToUTF8Array } from "./stringToUtf8Array.mjs";
import assert from "node:assert";
import { array_to_hex } from "../../lib-mlsag-js/bytes.mjs";

const testData = {
  asd: "617364",
  лолкек: "d0bbd0bed0bbd0bad0b5d0ba",
  "👉🏿": "f09f9189f09f8fbf",
  "👨‍👦": "f09f91a8e2808df09f91a6",
};

Object.entries(testData).forEach(([string, expectedHex]) => {
  test(`${string}`, () => {
    const arr = new Uint8Array(stringToUTF8Array(string));
    assert.strictEqual(array_to_hex(arr), expectedHex);
  });
});

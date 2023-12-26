import fs from "fs";
import test from "node:test";
import assert from "node:assert";
import { MLSAG_Verify } from "./ringct.mjs";

const testData = JSON.parse(
  fs.readFileSync("./ringct.testdata.json").toString()
);
for (const [index, testDataItem] of testData.entries()) {
  test(`Signature ${index}`, () => {
    const { messageHash, publicKeys, ...signature } = testDataItem;
    assert.ok(MLSAG_Verify(messageHash, publicKeys, signature));
  });
}

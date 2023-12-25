import fs from "fs";
import test from "node:test";
import assert from "node:assert";
import { MLSAG_Ver_Serialized } from "./ringct.mjs";

const testData = JSON.parse(fs.readFileSync("./ringct.testdata.json").toString());
for (const [index, sig] of testData.entries()) {
  test(`Signature ${index}`, () => {
    assert.ok(MLSAG_Ver_Serialized(sig));
  });
}

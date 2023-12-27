import test from "node:test";
import { hex_to_array } from "./bytes.mjs";
import { MLSAG_Ver } from "./mlsag.mjs";
import assert from "node:assert";

test("MLSAG_Ver", () => {
  const message = hex_to_array("0100000000000000000000000000000000000000000000000000000000000000");
  const pk = [
    [hex_to_array("020a1d0fcedbff784a0d37aadc9f08281d09e757d0d3a108f15dc5e129ff6567")],
    [hex_to_array("d6a54881a7bfca45e69cc125e24b097c292d73f273dadadf654413ea51e8e6b2")],
    [hex_to_array("b0d60e171a93040990119d6efde35219338abc93821f31b9ce93b4e483c861d5")],
  ];
  /** @type {import("./mlsag.types").mgSig} */
  const sig = {
    II: [hex_to_array("8ffe582e1a03fca6cba1603b8ab8efbe7199b12c5059b39475fae3f329e27382")],
    cc: hex_to_array("ab0f2dbef3c3b81aed98c934bf7555684fd68a42c9f2915796ac95fbad0dc800"),
    ss: [
      [hex_to_array("b3509a62706297ae6e22a8c67d2c9ac4b5b378ace34ce7aba22368c133f29500")],
      [hex_to_array("446522abcc031c54d2bcbcf72953cdc115ffd0afe5eb9e0c7bfbe69bacdede00")],
      [hex_to_array("ca14d61ee1772e9538a358c639bacdb8607b34fe345574aebbb35671184ef203")],
    ],
  };

  assert.ok(MLSAG_Ver(message, pk, sig, 1));

  const fail_message = hex_to_array(
    "0200000000000000000000000000000000000000000000000000000000000000",
  );
  assert.ok(!MLSAG_Ver(fail_message, pk, sig, 1));
});

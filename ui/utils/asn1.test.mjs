import { describe, it } from "node:test";
import { packIntForAsn } from "./asn1.mjs";
import assert from "node:assert";

describe(`Asn tools`, () => {
  describe(`packIntForAsn`, () => {
    const data = {
      "000000": "00",
      FF: "00FF",
      "00CE": "00CE",
      1234: "1234",
      "0000001234": "1234",
      "000000FA": "00FA",
    };
    for (const [src, expected] of Object.entries(data)) {
      it(`Packs ${src} -> ${expected}`, () =>
        assert.strictEqual(
          Buffer.from(packIntForAsn(Buffer.from(src, "hex")))
            .toString("hex")
            .toUpperCase(),
          expected
        ));
    }
  });
});

import { describe, it } from "node:test";
import { asn1parse, packIntForAsn } from "./asn1.mjs";
import assert from "node:assert";
import { base64tobuf } from "./base64tobuf.mjs";

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

  describe(`Asn1parse`, () => {
    const [parsed1, rest1] = asn1parse(
      base64tobuf(
        "MC4CAQAwBQYDK2VwBCIEIBrpDOAV21AtzIp6HNaQo+HUFYZD96AV3ZFjQ61P1kTa"
      )
    );
    assert.strictEqual(rest1.length, 0);

    assert.deepStrictEqual(parsed1, {
      type: "sequence",
      value: [
        { type: "integer", value: new Uint8Array([0]) },
        {
          type: "sequence",
          value: [{ type: "oid", value: new Uint8Array([43, 101, 112]) }],
        },
        {
          type: "octetstring",
          value: new Uint8Array([
            4, 32, 26, 233, 12, 224, 21, 219, 80, 45, 204, 138, 122, 28, 214,
            144, 163, 225, 212, 21, 134, 67, 247, 160, 21, 221, 145, 99, 67,
            173, 79, 214, 68, 218,
          ]),
        },
      ],
    });
  });
});

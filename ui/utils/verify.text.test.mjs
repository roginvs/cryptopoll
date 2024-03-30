/*{
  // Local dev test
  signed_message_el.value =
    '';
  ring_pubkeys_el.value = `
`;
}
*/

import assert from "node:assert";
import { describe, it } from "node:test";
import { verifySignatureText } from "./verify.text.mjs";

const signedMessageText = `{"m":"Test message",
  "mh":"ceb871db69754f583338155828aa4ed5d9c89918bd9227275b0a71515469254a",
  "sig":{"II":"7bc78dbe5f03cf410e4ca912ff4c669e8b66cf84b8b367778db33f631f176b55",
  "cc":"e472b03446aa6e996ac6e8886c2fafa454338f95fab13a0012902657d80a5c0c",
  "ss":["0245cfad63d5259caac40c2353f7493f7fb7e028c749aa70f993b54a324e0d07",
  "f485c66e38c5818d30c806aba6debab49739a97824ab6eb1632145076eb07c03",
  "80569803495449626da44e9a7403bebe26e3db1700b7b3cb4125ad2c4c807d06"]}}`;

const publicKeysText = `

# lol

f9a8e6bba0a5145f85efb1ee0c73373acc626f183b4c1033e5a3c4c7e1329ffc

d6610d244384c25d416058677b429e8ef991eb4550b768b75898f678b0c1b9b5

80e9fa62f672874497418fd05a96c982f2ae00fe497597047e17fce40b81b323

`;

describe("verifySignatureText", () => {
  it("works ok on correct signature", () => {
    const sig = verifySignatureText(signedMessageText, publicKeysText);
    assert.strictEqual(
      sig.sig.II,
      "7bc78dbe5f03cf410e4ca912ff4c669e8b66cf84b8b367778db33f631f176b55"
    );
    assert.strictEqual(sig.m, "Test message");
  });
  it(`Throws on incorrect signature`, () => {
    const incorrectSig = `{"m":"Test message 1",
  
  "sig":{"II":"7bc78dbe5f03cf410e4ca912ff4c669e8b66cf84b8b367778db33f631f176b55",
  "cc":"e472b03446aa6e996ac6e8886c2fafa454338f95fab13a0012902657d80a5c0c",
  "ss":["0245cfad63d5259caac40c2353f7493f7fb7e028c749aa70f993b54a324e0d07",
  "f485c66e38c5818d30c806aba6debab49739a97824ab6eb1632145076eb07c03",
  "80569803495449626da44e9a7403bebe26e3db1700b7b3cb4125ad2c4c807d06"]}}`;
    assert.throws(
      () => verifySignatureText(incorrectSig, publicKeysText),
      new Error("Wrong signature")
    );
  });
});

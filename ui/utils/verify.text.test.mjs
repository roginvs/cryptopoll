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

const signedMessageText = JSON.stringify({
  m: "Test message",
  mh: "ceb871db69754f583338155828aa4ed5d9c89918bd9227275b0a71515469254a",
  pkh: "40404ec6a7da42ac8976291614be5dd10573a1832542575783808552776e9514",
  sig: {
    II: "1786d67fcd8d7a1b5626e76b64110db23030af6237c96cb9dcccefcb1c4dda8e",
    cc: "7119bc0d6d2ec33004e1617e9957ee358c267a4bb5cd359bc3640e078e948a07",
    ss: [
      "0cdfbea21aa576c894b9e69087f82a4a96a53f83b5b5c4bb0852ce5db6347b07",
      "452751588463225a68d30a5d316e10203959180b85af571ba2eefd1aba516e07",
      "105394baebef66583855a36026c56f8d7a06b5560556b9d4f39c14c9b4c87806",
      "49b29b98f2687cbb8dd0c332e1c4b37ed8af8f55aa81fec6c8671461c26a5800",
    ],
  },
});

const publicKeysText = `

# comment

d6610d244384c25d416058677b429e8ef991eb4550b768b75898f678b0c1b9b5
66866748a34b50e52197ebc9dce8ef82e9223ed0685e6efbeb816071640bca27

ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPmj4NfVFZBaGLXSuySp8z1Im4TyX/wZ/WoZBaaijR8v vasilii@carbon

ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFcm0CozMlc6qwqR8P0mWV+A/uoeZYMXUVRkiBo0ugZj

`;

describe("verifySignatureText", () => {
  it("works ok on correct signature", () => {
    const sig = verifySignatureText(signedMessageText, publicKeysText);
    assert.strictEqual(
      sig.sig.II,
      "1786d67fcd8d7a1b5626e76b64110db23030af6237c96cb9dcccefcb1c4dda8e"
    );
    assert.strictEqual(sig.m, "Test message");
  });
  it(`Throws on incorrect signature`, () => {
    const incorrectSig = JSON.stringify({
      m: "Test message 111",
      pkh: "40404ec6a7da42ac8976291614be5dd10573a1832542575783808552776e9514",
      sig: {
        II: "1786d67fcd8d7a1b5626e76b64110db23030af6237c96cb9dcccefcb1c4dda8e",
        cc: "7119bc0d6d2ec33004e1617e9957ee358c267a4bb5cd359bc3640e078e948a07",
        ss: [
          "0cdfbea21aa576c894b9e69087f82a4a96a53f83b5b5c4bb0852ce5db6347b07",
          "452751588463225a68d30a5d316e10203959180b85af571ba2eefd1aba516e07",
          "105394baebef66583855a36026c56f8d7a06b5560556b9d4f39c14c9b4c87806",
          "49b29b98f2687cbb8dd0c332e1c4b37ed8af8f55aa81fec6c8671461c26a5800",
        ],
      },
    });
    assert.throws(
      () => verifySignatureText(incorrectSig, publicKeysText),
      new Error("Wrong signature")
    );
  });
});

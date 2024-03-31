import { describe, it } from "node:test";
import { ed25519_secret_to_privatekey } from "./ed25519-secret-to-key.mjs";

describe("ed25519_secret_to_privatekey", () => {
  it("should return private key", async () => {
    const secret = new Uint8Array([
      44, 202, 250, 237, 130, 162, 247, 196, 123, 27, 71, 163, 116, 151, 99,
      162, 129, 37, 183, 0, 17, 191, 118, 71, 252, 230, 244, 248, 110, 180, 162,
      253,
    ]);
    const privateKey = await ed25519_secret_to_privatekey(secret);

    console.info(Buffer.from(privateKey).toString("hex"));
  });
});

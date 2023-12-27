import test from "node:test";
import { array_to_bigint_LE, array_to_hex, hex_to_array } from "./bytes.mjs";
import { B, ge_tobytes, point_power } from "./ed25519.mjs";
import { hash_to_p3 } from "./hash_to_p3.mjs";
import assert from "node:assert";

test("public key", () => {
  const privateKey = array_to_bigint_LE(
    hex_to_array("23c89d2575f64b9e324aa11b330d81484f6d0c16e65d913853528ba162a80906"),
  );

  const publicKeyExpected = "5a6bd1e0ebf06215334fec3e1b5fd67c6b4ca1ef85a4cbdd95736f92ea3c3020";
  const publicKeyPointEncoded = ge_tobytes(point_power(B, privateKey));
  assert.strictEqual(array_to_hex(publicKeyPointEncoded), publicKeyExpected);
});

test("hash_to_p3", () => {
  const k = hex_to_array("0100000000000000000000000000000000000000000000000000000000000000");

  assert.strictEqual(
    array_to_hex(ge_tobytes(hash_to_p3(k))),
    "975e7110abf5159693666d888b8e2386a1600093ff0ebf4838d1f9f927ca6b41",
  );
});

test("Public key and key image", () => {
  const privateKey = array_to_bigint_LE(
    hex_to_array("c32ba936d41d3a348a82bd58889227dd477ceab1bc50cfe1028504b15aa7740b"),
  );

  const publicKeyExpected = "b0d60e171a93040990119d6efde35219338abc93821f31b9ce93b4e483c861d5";
  const publicKeyPointEncoded = ge_tobytes(point_power(B, privateKey));
  assert.strictEqual(array_to_hex(publicKeyPointEncoded), publicKeyExpected);

  assert.strictEqual(
    array_to_hex(ge_tobytes(point_power(hash_to_p3(publicKeyPointEncoded), privateKey))),
    "8ffe582e1a03fca6cba1603b8ab8efbe7199b12c5059b39475fae3f329e27382",
  );
});

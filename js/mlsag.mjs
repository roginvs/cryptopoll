import { array_to_bigint_LE } from "./bytes.mjs";
import { B, L, ge_frombytes, ge_tobytes, is_zero, point_add, point_power } from "./ed25519.mjs";
import { hash_to_p3 } from "./hash_to_p3.mjs";
import { Keccak } from "./keccak.mjs";

/**
 *
 * @param {import("./mlsag.types").Key} message
 * @param {import("./mlsag.types").KeyM} pk
 * @param {import("./mlsag.types").mgSig} rv
 * @param {number} dsRows
 */
export function MLSAG_Ver(message, pk, rv, dsRows) {
  const cols = pk.length;
  if (cols < 2) {
    throw new Error("Signature must contain more than one public key");
  }
  const rows = pk[0].length;
  if (rows < 1) {
    throw new Error("Bad total row number");
  }
  for (const col of pk) {
    if (col.length !== rows) {
      throw new Error("Bad public key matrix dimensions");
    }
  }
  if (rv.II.length !== dsRows) {
    throw new Error("Wrong number of key images present");
  }
  if (rv.ss.length !== cols) {
    throw new Error("Bad scalar matrix dimensions");
  }
  for (const rvSsItem of rv.ss) {
    if (rvSsItem.length !== rows) {
      throw new Error("Bad scalar matrix dimensions");
    }
  }
  if (dsRows > rows) {
    throw new Error("Non-double-spend rows cannot exceed total rows");
  }

  const II_ge = rv.II.map((image) => ge_frombytes(image));

  II_ge.forEach((image) => {
    if (is_zero(image)) {
      throw new Error("Bad key image");
    }
    const image_by_L = point_power(image, L);
    if (!is_zero(image_by_L)) {
      throw new Error("Bad key image");
    }
  });

  const ss_int = rv.ss.map((vec) =>
    vec.map((ssItem) => {
      const n = array_to_bigint_LE(ssItem) % L;
      if (n === 0n) {
        throw new Error("Bad signature scalar");
      }
      return n;
    }),
  );

  const pk_ge = pk.map((vec) => vec.map((pk) => ge_frombytes(pk)));

  const cc_int = array_to_bigint_LE(rv.cc) % L;
  if (cc_int === 0n) {
    throw new Error("Bad initial signature hash");
  }

  const ndsRows = 3 * dsRows;
  /** @type {Uint8Array[]} */
  const toHash = new Array(1 + 3 * dsRows + 2 * (rows - dsRows));

  let c_old = cc_int;

  toHash[0] = message;

  let i = 0;

  while (i < cols) {
    for (let j = 0; j < dsRows; j++) {
      const L = ge_tobytes(
        point_add(point_power(B, ss_int[i][j]), point_power(pk_ge[i][j], c_old)),
      );
      const R = ge_tobytes(
        point_add(point_power(hash_to_p3(pk[i][j]), ss_int[i][j]), point_power(II_ge[j], c_old)),
      );
      toHash[3 * j + 1] = pk[i][j];
      toHash[3 * j + 2] = L;
      toHash[3 * j + 3] = R;
    }

    for (let j = dsRows; j < rows; j++) {
      const L = ge_tobytes(
        point_add(point_power(B, ss_int[i][j]), point_power(pk_ge[i][j], c_old)),
      );
      const ii = j - dsRows;
      toHash[ndsRows + 2 * ii + 1] = pk[i][j];
      toHash[ndsRows + 2 * ii + 2] = L;
    }

    const hash = new Keccak("keccak256");
    for (const hashItem of toHash) {
      hash.update(hashItem);
    }
    c_old = array_to_bigint_LE(hash.digest()) % L;
    if (c_old === 0n) {
      throw new Error("Bad signature hash");
    }

    i++;
  }

  return c_old === cc_int;
}

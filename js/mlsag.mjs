import { array_to_bigint_LE, bigint_to_array_LE } from "./bytes.mjs";
import {
  B,
  L,
  ge_frombytes,
  ge_tobytes,
  is_zero,
  point_add,
  point_power,
} from "./ed25519.mjs";
import { getRandomValues } from "./getRandomValues.mjs";
import { hash_to_p3 } from "./hash_to_p3.mjs";
import { Keccak } from "./keccak.mjs";

/** @param {import("./mlsag.types").KeyV} toHash */
function hash_arrays(toHash) {
  const hash = new Keccak("keccak256");
  for (const hashItem of toHash) {
    hash.update(hashItem);
  }
  return hash.digest();
}
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
    })
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
        point_add(point_power(B, ss_int[i][j]), point_power(pk_ge[i][j], c_old))
      );
      const R = ge_tobytes(
        point_add(
          point_power(hash_to_p3(pk[i][j]), ss_int[i][j]),
          point_power(II_ge[j], c_old)
        )
      );
      toHash[3 * j + 1] = pk[i][j];
      toHash[3 * j + 2] = L;
      toHash[3 * j + 3] = R;
    }

    for (let j = dsRows; j < rows; j++) {
      const L = ge_tobytes(
        point_add(point_power(B, ss_int[i][j]), point_power(pk_ge[i][j], c_old))
      );
      const ii = j - dsRows;
      toHash[ndsRows + 2 * ii + 1] = pk[i][j];
      toHash[ndsRows + 2 * ii + 2] = L;
    }

    c_old = array_to_bigint_LE(hash_arrays(toHash)) % L;
    if (c_old === 0n) {
      throw new Error("Bad signature hash");
    }

    i++;
  }

  return c_old === cc_int;
}

/**
 *
 * @param {import("./mlsag.types").Key} message
 * @param {import("./mlsag.types").KeyM} pk
 * @param {import("./mlsag.types").KeyV} xx
 * @param {number} index
 * @param {number} dsRows
 * @returns {import("./mlsag.types").mgSig}
 */
export function MLSAG_Gen(message, pk, xx, index, dsRows) {
  const cols = pk.length;
  if (cols < 2) {
    throw new Error("Error! What is c if cols = 1!");
  }
  if (index >= cols || index < 0) {
    throw new Error("Index out of range");
  }
  const rows = pk[0].length;
  if (rows < 1) {
    throw new Error("Empty pk");
  }
  for (let i = 1; i < cols; ++i) {
    if (pk[i].length !== rows) {
      throw new Error("pk is not rectangular");
    }
  }
  if (xx.length !== rows) {
    throw new Error("Bad xx size");
  }
  if (dsRows > rows || dsRows < 0) {
    throw new Error("Bad dsRows size");
  }

  /** @type {import("./mlsag.types").mgSig} */
  const rv = {
    II: new Array(dsRows),
    cc: new Uint8Array(32).fill(0),
    ss: new Array(cols).fill([]).map(() => new Array(rows)),
  };

  /** @type {import("./mlsag.types").KeyV} */
  const alpha = new Array(rows).fill(new Uint8Array(0)).map(() => {
    const buf = new Uint8Array(32);
    // Will be filled with random data later
    return buf;
  });
  /** @type {import("./mlsag.types").KeyV} */
  const aG = new Array(rows);
  /** @type {import("./mlsag.types").KeyV} */
  const aHP = new Array(dsRows);
  /** @type {import("./mlsag.types").KeyV} */
  const toHash = new Array(1 + 3 * dsRows + 2 * (rows - dsRows));

  toHash[0] = message;

  for (let i = 0; i < dsRows; i++) {
    toHash[3 * i + 1] = pk[index][i];
    const Hi = hash_to_p3(pk[index][i]);

    getRandomValues(alpha[i]);
    aG[i] = ge_tobytes(point_power(B, array_to_bigint_LE(alpha[i])));
    aHP[i] = ge_tobytes(point_power(Hi, array_to_bigint_LE(alpha[i])));
    rv.II[i] = ge_tobytes(point_power(Hi, array_to_bigint_LE(xx[i])));

    toHash[3 * i + 2] = aG[i];
    toHash[3 * i + 3] = aHP[i];
  }
  const ndsRows = 3 * dsRows; // non Double Spendable Rows (see identity chains paper)
  for (let i = dsRows; i < rows; i++) {
    const ii = i - dsRows;
    throw new Error("TODO");
    // skpkGen(alpha[i], aG[i]); // need to save alphas for later..
    // toHash[ndsRows + 2 * ii + 1] = pk[index][i];
    // toHash[ndsRows + 2 * ii + 2] = aG[i];
  }

  let c_old = array_to_bigint_LE(hash_arrays(toHash)) % L;

  let i = (index + 1) % cols;
  if (i == 0) {
    rv.cc = bigint_to_array_LE(c_old);
  }
  while (i != index) {
    rv.ss[i] = new Array(rows).fill(new Uint8Array(0)).map(() => {
      const b = new Uint8Array(32);
      getRandomValues(b);
      return b;
    });
    for (let j = 0; j < dsRows; j++) {
      const L = ge_tobytes(
        point_add(
          point_power(B, array_to_bigint_LE(rv.ss[i][j])),
          point_power(ge_frombytes(pk[i][j]), c_old)
        )
      );
      const Hi = hash_to_p3(pk[i][j]);

      const R = ge_tobytes(
        point_add(
          point_power(Hi, array_to_bigint_LE(rv.ss[i][j])),
          point_power(ge_frombytes(rv.II[j]), c_old)
        )
      );

      toHash[3 * j + 1] = pk[i][j];
      toHash[3 * j + 2] = L;
      toHash[3 * j + 3] = R;
    }

    for (let j = dsRows; j < rows; j++) {
      const ii = j - dsRows;
      throw new Error(`TODO`);
      //addKeys2(L, rv.ss[i][j], c_old, pk[i][j]);
      //toHash[ndsRows + 2 * ii + 1] = pk[i][j];
      //toHash[ndsRows + 2 * ii + 2] = L;
    }
    c_old = array_to_bigint_LE(hash_arrays(toHash)) % L;
    i = (i + 1) % cols;
    if (i == 0) {
      rv.cc = bigint_to_array_LE(c_old);
    }
  }

  // mlsag_sign(c_old, xx, alpha, rows, dsRows, rv.ss[index]);

  for (let j = 0; j < rows; j++) {
    rv.ss[index][j] = bigint_to_array_LE(
      (array_to_bigint_LE(alpha[j]) +
        (L - ((c_old * array_to_bigint_LE(xx[j])) % L))) %
        L
    );
    // sc_mulsub(ss[j].bytes, c.bytes, xx[j].bytes, alpha[j].bytes);
  }
  return rv;
}

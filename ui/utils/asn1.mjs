/**
 * @param {Uint8Array} b
 */
export function packIntForAsn(b) {
  if (b[0] !== 0 && !(b[0] & 0b10000000)) {
    // Valid case - not a zero and not negative
    return b;
  }
  if (b[0] === 0 && b[1] & 0b10000000) {
    // Ok, correct case, not negative because have leading zero
    return b;
  }

  let i = 0;
  while (i < b.length - 1 && b[i] === 0) {
    // Stop at previous to keep one
    i++;
  }

  const noLeadingZeros = b.subarray(i);
  if (noLeadingZeros[0] & 0b10000000) {
    // Still negative, so need to add zero
    return new Uint8Array([0, ...noLeadingZeros]);
  } else {
    // Ok, looks fine
    return noLeadingZeros;
  }
}

/**
 * @typedef { {type: "integer", value: Uint8Array} |
 *  { type: "oid", value: Uint8Array } |
 *  { type: "bitstring", value: Uint8Array } |
 *  { type: "octetstring", value: Uint8Array } |
 *  { type: "sequence", value: Asn1[] } } Asn1
 */
/**
 * Very simple asn1 parsing, just for validation purposes
 * @param {Uint8Array} buf
 * @returns {[Asn1, Uint8Array]}
 */
export function asn1parse(buf) {
  if (buf.length === 0) {
    throw new Error(`Empty buf!`);
  }
  const type = buf[0];
  if ((type & 0b11111) === 0b11111) {
    throw new Error("Long types are not supported");
  }
  if (buf.length < 1) {
    throw new Error(`Where is length?`);
  }
  const len = buf[1];
  if (len & 0b10000000) {
    throw new Error(`Long length is not supported ${len.toString(16)}`);
  }
  if (buf.length < 1 + 1 + len) {
    throw new Error("Buf is not enough length");
  }
  let data = buf.subarray(2, 2 + len);

  /** @type {Asn1} */
  let result;
  if (type === 0x30) {
    /** @type {Asn1[]} */
    const value = [];
    /** @type {Asn1} */
    let val;
    while (data.length > 0) {
      [val, data] = asn1parse(data);
      value.push(val);
    }
    result = {
      type: "sequence",
      value,
    };
  } else if (type === 0x06) {
    result = {
      type: "oid",
      value: data,
    };
  } else if (type === 0x02) {
    result = {
      type: "integer",
      value: data,
    };
  } else if (type === 0x03) {
    if (data[0] !== 0) {
      throw new Error(`Non byte bitstrings are not supported`);
    }
    result = {
      type: "bitstring",
      value: data.subarray(1),
    };
  } else if (type === 0x04) {
    result = {
      type: "octetstring",
      value: data,
    };
  } else {
    throw new Error(`Unknown type 0x${type.toString(16)}`);
  }

  const rest = buf.subarray(2 + len);
  return [result, rest];
}

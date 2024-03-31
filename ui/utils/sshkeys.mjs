import { getPublicKeyFromPrivateKey } from "../../lib-mlsag-wasm/index.mjs";
import { base64tobuf } from "./base64tobuf.mjs";
import { ed25519_secret_to_privatekey } from "./ed25519-secret-to-key.mjs";

const ssh_ed25519_magic_str = "ssh-ed25519";
const base64magicWithLenPrefix = "AAAAC3NzaC1lZDI1NTE5";

/** @param {string} s  */
export function is_ssh_ed25519_public_key(s) {
  return (
    s.startsWith(ssh_ed25519_magic_str) ||
    s.startsWith(base64magicWithLenPrefix)
  );
}

/**
 * @param {Uint8Array} buf
 */
function get_public_key_buf_from_ssh_ed25519_public_key_buf(buf) {
  const prefixBuf = base64tobuf(base64magicWithLenPrefix);
  if (buf.length !== prefixBuf.length + 4 + 0x20) {
    throw new Error("Wrong length");
  }

  if (
    buf[prefixBuf.length + 0] !== 0 ||
    buf[prefixBuf.length + 1] !== 0 ||
    buf[prefixBuf.length + 2] !== 0 ||
    buf[prefixBuf.length + 3] !== 0x20
  ) {
    throw new Error("Wrong length part");
  }

  if (buf.length !== prefixBuf.length + 4 + 0x20) {
    throw new Error("Wrong length");
  }

  return buf.subarray(prefixBuf.length + 4);
}

/**
 * @param {string} s
 */
export function get_public_key_buf_from_ssh_ed25519_public_key(s) {
  if (!is_ssh_ed25519_public_key) {
    throw new Error(`Not a ssh ed25519 public key`);
  }
  if (s.startsWith(ssh_ed25519_magic_str)) {
    const base64 = s.split(/\s+/)[1];
    if (!base64) {
      throw new Error("Not a ssh ed25519 public key, no base64 part");
    }
    return get_public_key_buf_from_ssh_ed25519_public_key_buf(
      base64tobuf(base64)
    );
  } else if (s.startsWith(base64magicWithLenPrefix)) {
    const base64 = s.split(/\s+/)[0];
    return get_public_key_buf_from_ssh_ed25519_public_key_buf(
      base64tobuf(base64)
    );
  } else {
    throw new Error("Not a ssh ed25519 public key");
  }
}

/**
 * @param {Uint8Array} buf
 */
export function endcode_public_key(buf) {
  if (buf.length !== 0x20) {
    throw new Error(`Not a ed25519 key`);
  }
  return (
    ssh_ed25519_magic_str +
    " " +
    base64magicWithLenPrefix +
    btoa(String.fromCharCode(0x0, 0x0, 0x0, 0x20, ...buf))
  );
}

/**
 * @param {string} str
 */
export function decode_ssh_secret(str) {
  const s = str
    .split(/\r|\n/)
    .filter((x) => x)
    .join("");

  const beginStr = "-----BEGIN OPENSSH PRIVATE KEY-----";
  if (!s.startsWith(beginStr)) {
    console.info(`kek`, s);
    throw new Error(`Key do not starts with ${beginStr}`);
  }
  const endStr = "-----END OPENSSH PRIVATE KEY-----";
  if (!s.endsWith(endStr)) {
    throw new Error(`Key do not ends with ${endStr}`);
  }
  const base64str = s.slice(beginStr.length, s.length - endStr.length);
  const buf = base64tobuf(
    base64str
      .split(/\s/)
      .filter((x) => x)
      .join("")
  );
  return decode_ssh_secret_buf(buf);
}

/**
 * @param {Uint8Array} buf
 */
function createByteReader(buf) {
  let pos = 0;

  const readUint32BE = () => {
    if (buf.length < pos + 4) {
      throw new Error(`Not enough buf for int at pos=${pos}`);
    }
    const dataView = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

    const int = dataView.getUint32(pos, false);
    pos += 4;

    return int;
  };

  const readStringBuf = () => {
    const len = readUint32BE();
    if (buf.length < pos + len) {
      throw new Error(`Not enough buf for string data at pos=${pos}`);
    }
    const data = buf.subarray(pos, pos + len);
    pos += len;
    return data;
  };

  return {
    /**
     * @param {Uint8Array|number[]} magic
     */
    checkMagic(magic) {
      for (let i = 0; i < magic.length; i++) {
        if (buf[pos] !== magic[i]) {
          throw new Error(`Wrong magic at pos=${i}`);
        }
        pos++;
      }
    },

    readUint32BE,
    readStringBuf,

    readString: () => {
      const b = readStringBuf();
      return String.fromCharCode(...b);
    },

    checkEnd() {
      if (pos !== buf.length) {
        throw new Error(`Some bytes left at pos=${pos}`);
      }
    },

    getPos() {
      return pos;
    },
  };
}

/**
 * @param {Uint8Array} buf
 * Returns secret value
 */
function read_ed25519_secret(buf) {
  const privReader = createByteReader(buf);
  const checkint1 = privReader.readUint32BE();
  const checkint2 = privReader.readUint32BE();
  if (checkint1 !== checkint2) {
    throw new Error(`Checkint mismatch`);
  }

  const magic = privReader.readString();
  if (magic !== ssh_ed25519_magic_str) {
    throw new Error(`Wrong magic`);
  }

  const publicKeyBufAgain = privReader.readStringBuf();
  if (publicKeyBufAgain.length !== 0x20) {
    throw new Error(`Wrong publicKeyBufAgain length`);
  }

  const privAndPub = privReader.readStringBuf();
  if (privAndPub.length !== 0x40) {
    throw new Error(`Wrong privAndPub length`);
  }
  const privBuf = privAndPub.subarray(0, 0x20);
  const pubBuf = privAndPub.subarray(0x20, 0x40);

  for (let i = 0; i < publicKeyBufAgain.length; i++) {
    if (pubBuf[i] !== publicKeyBufAgain[i]) {
      throw new Error(`Public key mismatch at pos=${i}`);
    }
  }

  // comment string
  privReader.readString();

  const paddingStart = privReader.getPos();
  let i = 0;
  while (paddingStart + i < buf.length) {
    if (buf[paddingStart + i] !== i + 1) {
      throw new Error(`Wrong padding at pos=${paddingStart + i}`);
    }
    i++;
  }

  return [privBuf, pubBuf];
}

/**
 * @param {Uint8Array} buf
 */
export function decode_ssh_secret_buf(buf) {
  const reader = createByteReader(buf);

  // "openssh-key-v1";
  const magic = [
    111, 112, 101, 110, 115, 115, 104, 45, 107, 101, 121, 45, 118, 49, 0,
  ];
  reader.checkMagic(magic);

  const ciphername = reader.readString();
  if (ciphername !== "none") {
    throw new Error(`ciphername ${ciphername} is not supported yet`);
  }

  const kdfname = reader.readString();
  if (kdfname !== "none") {
    throw new Error(`kdfname ${kdfname} is not supported yet`);
  }

  const kdfoptions = reader.readStringBuf();
  if (kdfoptions.length !== 0) {
    throw new Error(`kdfoptions ${kdfoptions} is not supported yet`);
  }

  const keysCount = reader.readUint32BE();

  if (keysCount !== 1) {
    throw new Error(`Only supported amount of keys is 1`);
  }

  const publicKeyBuf = reader.readStringBuf();
  const publicKey =
    get_public_key_buf_from_ssh_ed25519_public_key_buf(publicKeyBuf);

  const secretKeyBuf = reader.readStringBuf();
  reader.checkEnd();

  const [secret, publicKeyBufAgain] = read_ed25519_secret(secretKeyBuf);
  for (let i = 0; i < publicKey.length; i++) {
    if (publicKey[i] !== publicKeyBufAgain[i]) {
      throw new Error(`Public key mismatch at pos=${i}`);
    }
  }

  return [secret, publicKey];
}

/**
 * @param {string} str
 */
export async function decode_ssh_keyfile(str) {
  const [secret, publicKeyBufFromKeyfile] = decode_ssh_secret(str);
  const privateKey = await ed25519_secret_to_privatekey(secret);
  const publicKeyBufFromPrivate = getPublicKeyFromPrivateKey(privateKey);
  for (let i = 0; i < publicKeyBufFromPrivate.length; i++) {
    if (publicKeyBufFromPrivate[i] !== publicKeyBufFromKeyfile[i]) {
      throw new Error(`Public key mismatch at pos=${i}`);
    }
  }

  return [privateKey, publicKeyBufFromPrivate];
}

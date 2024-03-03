/**
 * @param {Uint8Array} key
 */

import { array_to_hex, hex_to_array } from "./bytes.mjs";
import { memoryView, wasm } from "./wasm.mjs";

/**
 * @param {Uint8Array} key
 */
function assertKey(key) {
  if (!(key instanceof Uint8Array)) {
    throw new Error(`Not a Uint8Array`);
  }
  if (key.length !== 32) {
    throw new Error(`Wrong key length`);
  }
}
/**
 * @param {Uint8Array} key
 */
export function getPublicKeyFromPrivateKey(key) {
  assertKey(key);
  const keys_addr = wasm.allocate_keys(2);
  memoryView.set(key, keys_addr);
  wasm.scalarmultBase(keys_addr + 32, keys_addr);
  const buf = new Uint8Array(32);
  buf.set(memoryView.subarray(keys_addr + 32, keys_addr + 32 + 32));
  memoryView.set(new Uint8Array(64).fill(0), keys_addr);
  wasm.free_keys(keys_addr);
  return buf;
}

export function generatePrivateKey() {
  const addr = wasm.allocate_keys(1);
  wasm.skGen(addr);
  const buf = new Uint8Array(32).fill(0);
  buf.set(memoryView.subarray(addr, addr + 32));
  wasm.free_keys(addr);
  return buf;
}

/**
 *
 * @param {Uint8Array} message
 * @param {Uint8Array} privateKey
 * @param {Uint8Array[]} publicKeys
 */
export function LSAG_Signature(message, privateKey, publicKeys) {
  assertKey(message);
  assertKey(privateKey);
  publicKeys.forEach((pk) => assertKey(pk));

  const messageAddr = wasm.allocate_keys(1);
  memoryView.set(message, messageAddr);

  const privAddr = wasm.allocate_keys(1);
  memoryView.set(privateKey, privAddr);

  const pubkeysAddrs = wasm.allocate_keys(publicKeys.length);
  for (let i = 0; i < publicKeys.length; i++) {
    memoryView.set(publicKeys[i], pubkeysAddrs + 32 * i);
  }

  let sigAddr = 0;
  try {
    sigAddr = wasm.LSAG_Signature(
      messageAddr,
      privAddr,
      publicKeys.length,
      pubkeysAddrs
    );

    /** @type {import("./ringct.types").LSAG_Signature<string>} */
    const sig = {
      II: array_to_hex(memoryView.subarray(sigAddr, sigAddr + 32)),
      cc: array_to_hex(memoryView.subarray(sigAddr + 32, sigAddr + 32 + 32)),
      ss: new Array(publicKeys.length)
        .fill(0)
        .map((_, i) =>
          array_to_hex(
            memoryView.subarray(
              sigAddr + 32 + 32 + 32 * i,
              sigAddr + 32 + 32 + 32 * i + 32
            )
          )
        ),
    };

    return sig;
  } catch (e) {
    throw e;
  } finally {
    wasm.free_keys(pubkeysAddrs);
    wasm.free_keys(messageAddr);
    if (privAddr) {
      memoryView.set(new Uint8Array(32).fill(0), privAddr);
    }
    wasm.free_keys(privAddr);
    wasm.free_keys(sigAddr);
  }
}

/**
 *
 * @param {Uint8Array | string} key
 */
function toKey(key) {
  const out = typeof key === "string" ? hex_to_array(key) : key;
  assertKey(out);
  return out;
}
/**
 * @param { string | Uint8Array } message
 * @param { (string | Uint8Array)[] } publicKeys
 * @param { import("./ringct.types").LSAG_Signature<string | Uint8Array>} signature
 */
export function LSAG_Verify(message, publicKeys, signature) {
  let dataAddr = 0;
  let sigAddr = 0;
  try {
    // [message, key1, ... , keyN]
    dataAddr = wasm.allocate_keys(publicKeys.length + 1);
    memoryView.set(toKey(message), dataAddr);
    for (let i = 0; i < publicKeys.length; i++) {
      memoryView.set(toKey(publicKeys[i]), dataAddr + 32 + 32 * i);
    }

    // [II, cc, ss1, ... , ssN ]
    sigAddr = wasm.allocate_keys(publicKeys.length + 2);
    memoryView.set(toKey(signature.II), sigAddr);
    memoryView.set(toKey(signature.cc), sigAddr + 32);
    for (let i = 0; i < publicKeys.length; i++) {
      memoryView.set(toKey(signature.ss[i]), sigAddr + 32 + 32 + 32 * i);
    }

    try {
      const result = wasm.LSAG_Verify(
        dataAddr,
        publicKeys.length,
        dataAddr + 32,
        sigAddr
      );
      if (!result) {
        throw new Error();
      }
    } catch (e) {
      throw new Error(`Wrong signature`);
    }
  } catch (e) {
    console.info(e);
    return false;
  } finally {
    if (dataAddr) {
      wasm.free_keys(dataAddr);
    }
    if (sigAddr) {
      wasm.free_keys(sigAddr);
    }
  }

  return true;
}

/**
 * @param {Uint8Array | Uint8Array[]} data
 */
export function keccak(data) {
  const dataArray = Array.isArray(data) ? data : [data];

  const totalLength = dataArray.reduce((prev, cur) => prev + cur.length, 0);

  // It is wrong to use keys allocator but it works anyway
  const bufAddr = wasm.allocate_keys(Math.ceil(totalLength / 32));

  {
    let i = 0;
    for (const buf of dataArray) {
      memoryView.set(buf, bufAddr + i);
      i += buf.length;
    }
  }

  const hashAddr = wasm.allocate_keys(1);

  wasm.cn_fast_hash(hashAddr, bufAddr, totalLength);

  const out = new Uint8Array(32);
  out.set(memoryView.subarray(hashAddr, hashAddr + 32));

  wasm.free_keys(hashAddr);
  wasm.free_keys(bufAddr);
  return out;
}

import { hex_to_key } from "../lib-mlsag-js/hex_to_key.mjs";
import { memoryView, wasm } from "../lib-mlsag-wasm/index.mjs";
import { byId } from "./byId.mjs";

/**
 * @param {Uint8Array} privateKey
 */
function startWithPrivateKey(privateKey) {
  // TODO
}

const LOCALSTORAGE_PRIV_KEY_KEY = "private-key";

const public_key_el = byId("public_key");

function start() {
  const savedKey = localStorage.getItem(LOCALSTORAGE_PRIV_KEY_KEY);
  if (!savedKey) {
    return;
  }
  const keyBuf = hex_to_key(savedKey);
  startWithPrivateKey(keyBuf);
}

async function generatePrivateKey() {
  const keypair_info = byId("keypair_info");
  keypair_info.innerText = "Generating...";
  for (let i = 0; i < 64; i++) {
    public_key_el.innerText = "*".repeat(i + 1) + "-".repeat(64 - i - 1);
    await new Promise((r) => setTimeout(r, 20));
  }
  const buf = (() => {
    const addr = wasm.allocate_keys(1);
    wasm.skGen(addr);
    const buf = new Uint8Array(32);
    buf.set(memoryView.subarray(addr, addr + 32));
    memoryView.set(new Uint8Array(32).fill(0), addr);
    wasm.free_keys(addr);
    return buf;
  })();
  startWithPrivateKey(buf);
}

byId("generate_keypair").addEventListener("click", (e) => {
  e.preventDefault();
  generatePrivateKey();
});

start();

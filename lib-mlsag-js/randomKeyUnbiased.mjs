import { array_to_bigint_LE, bigint_to_array_LE } from "./bytes.mjs";
import { L } from "./ed25519.mjs";

const limit = 15n * L;

export function randomKeyUnbiased() {
  while (true) {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    let n = array_to_bigint_LE(randomBytes);
    randomBytes.fill(0);

    if (!(n < limit)) {
      continue;
    }

    n = n % L;

    if (n !== 0n) {
      return bigint_to_array_LE(n, 32);
    }
  }
}

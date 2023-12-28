/**
 * @param {string} str
 *
 * https://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
 * from emscripten
 */
export function stringToUTF8Array(str) {
  const outU8Array = /** @type {number[]} */ ([]);

  let outIdx = 0;

  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 0xd800 && u <= 0xdfff) {
      var u1 = str.charCodeAt(++i);
      u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
    }
    if (u <= 127) {
      outU8Array[outIdx++] = u;
    } else if (u <= 2047) {
      outU8Array[outIdx++] = 192 | (u >> 6);
      outU8Array[outIdx++] = 128 | (u & 63);
    } else if (u <= 65535) {
      outU8Array[outIdx++] = 224 | (u >> 12);
      outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 128 | (u & 63);
    } else {
      outU8Array[outIdx++] = 240 | (u >> 18);
      outU8Array[outIdx++] = 128 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 128 | (u & 63);
    }
  }
  return outU8Array;
}

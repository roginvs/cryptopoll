import { LSAG_Signature } from "../lib-mlsag-js/ringct.types";

export interface SignedMessage {
  /** A message itself */
  m: string;
  /** Message hash (keccak), to ensure that message was encoded correctly. Optional */
  mh?: string;
  /** Hash of public keys. Optional */
  pkh?: string;
  /** Signature */
  sig: LSAG_Signature<string>;
}

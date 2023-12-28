import { LSAG_Signature } from "../lib-mlsag-js/ringct.types";

export interface SignedMessage {
  m: string;
  mh: string;
  sig: LSAG_Signature<string>;
}

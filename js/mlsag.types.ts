/** 32 bytes length */
export type Key = Uint8Array;
export type KeyV = Key[];
export type KeyM = KeyV[];

export interface mgSig {
  ss: KeyM;
  cc: Key;
  /** Key images */
  II: KeyV;
}

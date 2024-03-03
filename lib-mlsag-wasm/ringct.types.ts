export interface MLSAG_Signature<
  T extends string | Uint8Array = string | Uint8Array
> {
  ss: T[][];
  cc: T;
  II: T[];
}

export interface LSAG_Signature<
  T extends string | Uint8Array = string | Uint8Array
> {
  ss: T[];
  cc: T;
  II: T;
}

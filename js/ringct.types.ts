export interface SerializedMLSAG {
  ss: string[][];
  cc: string;
  II: string[];
}
export interface SerializedMLSAGFull extends SerializedMLSAG {
  messageHash: string;
  publicKeys: string[][];
}

export interface SerializedbLSAG {
  ss: string[];
  cc: string;
  /** This is key image */
  II: string;
}
export interface SerializedbLSAGFull extends SerializedMLSAG {
  messageHash: string;
  publicKeys: string[];
}

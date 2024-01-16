export interface TallyResult {
  tally: { [a: string]: number };
  n: number;
  dt: number;
}

export interface Info {
  publicKey: CryptoKey;
  publicKeyString: string;
  title: string;
  description?: string;
}

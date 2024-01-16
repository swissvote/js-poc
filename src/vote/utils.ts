import * as CryptoHelper from "./crypto-helper";
import { Info, TallyResult } from "./type";

const getKeyPairFromServer = async (): Promise<CryptoKeyPair> => {
  const r = await fetch("./keypair.json", {
    headers: { "content-type": "application/json" },
  });

  const imported: { publicKeyString: string; privateKeyString: string } =
    await r.json();

  return CryptoHelper.importKeyPair(
    imported.publicKeyString,
    imported.privateKeyString
  );
};

const getPublicKeyFromServer = async () =>
  getKeyPairFromServer().then((x) => x.publicKey);

export const getInfoFromServer = async (): Promise<Info> => {
  const publicKey = await getPublicKeyFromServer();
  const title = "My Vote";
  const publicKeyString = await CryptoHelper.exportPublicKey(publicKey);
  return { title, publicKey, publicKeyString };
};

export const publicKeyEncrypt = async (vote: string, publicKey: CryptoKey) =>
  CryptoHelper.encryptMessage(publicKey, vote);

export const tallyVote = async (
  encryptedVotes: ArrayBuffer[]
): Promise<TallyResult> => {
  const t0 = new Date().getTime();
  const keypair = await getKeyPairFromServer();
  const tally: { [a: string]: number } = {};
  const pvotes = encryptedVotes.map(async (encVote) => {
    return await CryptoHelper.decryptMessage(keypair.privateKey, encVote);
  });

  const votes = await Promise.all(pvotes);

  votes.forEach((vote) => {
    if (tally[vote]) {
      tally[vote]++;
    } else {
      tally[vote] = 1;
    }
  });

  const t1 = new Date().getTime();

  // console.log(votes.length, "votes cast", t1 - t0, "ms to tally votes");

  return { tally, n: votes.length, dt: t1 - t0 };
};

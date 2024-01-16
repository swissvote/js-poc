import React from "react";

import VoteComponent from "./vote-component";

import * as CryptoHelper from "../crypto-helper";

import { Info } from "../type";
import { publicKeyEncrypt } from "../utils";

const VoteWCast = ({
  info,
  onCast,
}: {
  info: Info;
  onCast: (r: { uidHash: string; encryptedVote: ArrayBuffer }) => void;
}) => {
  const handleVote = async (uid: string, vote: string) => {
    const encryptedVote = await publicKeyEncrypt(vote, info.publicKey);

    const uidHash = await CryptoHelper.computeHash(uid);

    onCast({ uidHash, encryptedVote });
  };

  return <VoteComponent onVote={handleVote} />;
};

export default VoteWCast;

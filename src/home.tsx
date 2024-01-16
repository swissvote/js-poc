import React from "react";

import * as CryptoHelper from "./crypto-helper";

import { Info, TallyResult } from "./type";
import { getInfoFromServer, tallyVote } from "./utils";
import { TallyResults } from "./tally-results";
import LayoutVote from "./layout-vote";
import InfoUI from "./info-ui";
import VoteWCast from "./vote-w-cast";

const Main = () => {
  const [info, setInfo] = React.useState<Info | null>(null);
  const [encryptedVotes, setencryptedVotes] = React.useState<
    [ArrayBuffer, string][]
  >([]);
  const [votersHash, setVotersHash] = React.useState<string[]>([]);
  const [tallyResults, setTallyResults] = React.useState<TallyResult | null>(
    null
  );

  React.useEffect(() => {
    getInfoFromServer().then(setInfo);
  }, []);

  if (info === null) {
    return <p>Loading vote info</p>;
  }

  const handleVote = async ({
    uidHash,
    encryptedVote,
  }: {
    uidHash: string;
    encryptedVote: ArrayBuffer;
  }) => {
    if (votersHash.includes(uidHash)) {
      alert("voter already cast their vote");
      return;
    }

    // here create zk snark
    const zkSnark = "zkSnark placeholder";

    setVotersHash([...votersHash, uidHash]);
    setencryptedVotes([...encryptedVotes, [encryptedVote, zkSnark]]);
  };

  return (
    <>
      <InfoUI info={info} />

      <div className="grid grid-cols-2 mt-3">
        <div>
          <VoteWCast info={info} onCast={handleVote} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            Vote Results <small>Server view</small>
          </h2>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() =>
              tallyVote(encryptedVotes.map(([x]) => x)).then(setTallyResults)
            }
          >
            TallyVotes
          </button>

          {tallyResults && <TallyResults tallyResults={tallyResults} />}

          <h3 className="text-xl font-bold my-4 text-gray-700">
            List of Votes
          </h3>
          {encryptedVotes.length === 0 && (
            <p>
              <i>No votes as of now</i>
            </p>
          )}
          <ul className="mt-2">
            {encryptedVotes.map(([vote, zkSnark], i) => (
              <li key={i}>
                {i + 1}.&nbsp;
                <code>
                  {CryptoHelper.firstAndLastChars(CryptoHelper.toBase64(vote))}
                </code>
                &nbsp;<code>{zkSnark}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default () => (
  <LayoutVote>
    <Main />
  </LayoutVote>
);

import React from "react";

import VoteComponent from "./VoteComponent";

import * as CryptoHelper from "./crypto-helper";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

interface Info {
  publicKey: CryptoKey;
  publicKeyString: string;
  title: string;
  description?: string;
}

const getInfoFromServer = async (): Promise<Info> => {
  const publicKey = await getPublicKeyFromServer();
  const title = "My Vote";
  const publicKeyString = await CryptoHelper.exportPublicKey(publicKey);
  return { title, publicKey, publicKeyString };
};

const publicKeyEncrypt = async (vote: string, publicKey: CryptoKey) =>
  CryptoHelper.encryptMessage(publicKey, vote);

interface TallyResult {
  tally: { [a: string]: number };
  n: number;
  dt: number;
}

const tallyVote = async (
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

  const handleVote = async (uid: string, vote: string) => {
    const publicKey = await getPublicKeyFromServer();
    const encrypted = await publicKeyEncrypt(vote, publicKey);

    const uidHash = await CryptoHelper.computeHash(uid);

    if (votersHash.includes(uidHash)) {
      alert("voter '" + uid + "' already cast their vote");
      return;
    }

    // here create zk snark
    const zkSnark = "zkSnark placeholder";

    setVotersHash([...votersHash, uidHash]);
    setencryptedVotes([...encryptedVotes, [encrypted, zkSnark]]);
  };

  return (
    <>
      <h2 className="text-2xl">{info.title}</h2>
      <p className="text-xs">
        <code>{CryptoHelper.firstAndLastChars(info.publicKeyString, 25)}</code>
      </p>

      <div className="grid grid-cols-2 mt-3">
        <div>
          <VoteComponent onVote={handleVote} />
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

          {tallyResults && (
            <>
              <div className="max-w-md mx-auto  rounded px-8 pt-6 pb-8 mb-4">
                <BarChartComponent tallyResults={tallyResults} />
                <ul className="list-disc space-y-2 pl-5">
                  {Object.entries(tallyResults.tally)
                    .sort(([k1], [k2]) => k1.localeCompare(k2))
                    .map(([k, v]) => (
                      <li key={k} className="text-gray-700 text-lg">
                        <span className="font-semibold">{k}:</span> {v}
                      </li>
                    ))}
                </ul>
                <p className="mt-4 text-gray-600 text-sm">
                  {tallyResults.n.toLocaleString()} votes, results computed in{" "}
                  <span className="font-mono text-green-600">
                    {tallyResults.dt}ms
                  </span>
                </p>
              </div>
            </>
          )}

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

const BarChartComponent = ({ tallyResults }: { tallyResults: TallyResult }) => {
  const orderedSet = Object.entries(tallyResults.tally).sort(([k1], [k2]) =>
    k1.localeCompare(k2)
  );

  const labels = orderedSet.map((x) => x[0]);
  const data = orderedSet.map((x) => x[1]);

  const dataset = {
    labels,
    datasets: [
      {
        label: "Vote Results",
        data,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Bar data={dataset} />;
};

export default () => (
  <div className="items-center justify-center h-screen p-3 rounded">
    <div className="p-6 bg-white rounded shadow-md">
      <Main />
    </div>
  </div>
);

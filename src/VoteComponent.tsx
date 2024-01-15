import React, { useState } from "react";
import { generateFriendlyString } from "./crypto-helper";

const VoteComponent = ({
  onVote,
}: {
  onVote: (uid: string, vote: string) => void;
}) => {
  const [vote, setVote] = useState<null | string>(null);
  const [uid, setUuid] = useState<null | string>(null);

  const submitVote = () => {
    if (uid === null || uid === "") {
      console.warn("UID must be given");
      return;
    }

    if (vote === null) {
      return;
    }
    console.log(`Vote submitted: ${vote}, for UID '${uid}'`);
    // Add logic to handle the vote submission
    onVote(uid, vote);
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Cast Your Vote</h2>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Voter UID
        </label>
        <input
          value={uid || ""}
          onChange={(e) => setUuid(e.target.value)}
          type="text"
          placeholder="Enter UID"
          className="border p-2 rounded"
        />
        &nbsp;
        <i
          onClick={() => setUuid(generateFriendlyString())}
          className="fa fa-refresh cursor-pointer"
          title={"refresh username"}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Choose an option:
        </label>
        <div className="flex gap-4">
          {["A", "B", "C"].map((option) => (
            <button
              key={option}
              className={`px-4 py-2 rounded ${
                vote === option ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setVote(option)}
            >
              Option {option}
            </button>
          ))}
        </div>
      </div>
      {vote !== null && (
        <>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={submitVote}
            disabled={!vote}
          >
            Submit Vote
          </button>
          &nbsp;
          <button
            className="px-4 py-2 border  text-black rounded "
            onClick={() => setVote(null)}
            disabled={!vote}
          >
            Reset
          </button>
        </>
      )}
    </>
  );
};

export default VoteComponent;

import React, { useState, useEffect } from "react";
import LayoutVote from "../ui/layout-vote";
import { Info, TallyResult } from "../type";
import InfoUI from "../ui/info-ui";

import VoteWCast from "../ui/vote-w-cast";
import { toBase64 } from "../crypto-helper";
import { TallyResults } from "../ui/tally-results";

import * as U from "./utils";

const WebSocketComponent = () => {
  const [info, setInfo] = React.useState<Info | null>(null);
  const [socket, setSocket] = useState<null | WebSocket>(null);
  const [tallyResults, setTallyResults] = useState<null | TallyResult>(null);

  // Connect to WebSocket server
  useEffect(() => {
    const newSocket = new WebSocket("wss://faq.nexys.io/ws/"); //"ws://localhost:8080");

    newSocket.onopen = () => {
      console.log("Connected to the WebSocket server");
    };

    newSocket.onmessage = ({ data }) => {
      try {
        const jData = JSON.parse(data);
        if ("publicKey" in jData && "title" in jData) {
          console.log("hello!", jData.title, jData.publicKey);

          U.importPublicKey(jData.publicKey)
            .then((publicKey) => {
              setInfo({
                title: jData.title,
                publicKey,
                publicKeyString: jData.publicKey,
              });
            })
            .catch((err) => {
              console.error(err);
            });
        }

        if ("tally" in jData) {
          setTallyResults(jData);
        }

        if ("error" in jData) {
          alert(jData.error);
        }
      } catch (err) {}
      // setMessages((prev) => [...prev, data]);
    };

    newSocket.onclose = () => {
      console.log("Disconnected from the WebSocket server");
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  if (!info || !socket) {
    return <p>Loading</p>;
  }

  const handleCast = (r: { uidHash: string; encryptedVote: ArrayBuffer }) => {
    socket.send(
      JSON.stringify({
        uidHash: r.uidHash,
        encryptedVote: toBase64(r.encryptedVote),
      })
    );
  };

  return (
    <LayoutVote>
      <>
        <InfoUI info={info} />
        <div className="grid grid-cols-2">
          <div>
            <VoteWCast info={info} onCast={handleCast} />
          </div>
          <div>
            {tallyResults && <TallyResults tallyResults={tallyResults} />}
          </div>
        </div>
      </>
    </LayoutVote>
  );
};

export default WebSocketComponent;

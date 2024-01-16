import React, { useState, useEffect } from "react";
import LayoutVote from "./layout-vote";
import { Info, TallyResult } from "./type";
import InfoUI from "./info-ui";

import VoteWCast from "./vote-w-cast";
import { toBase64 } from "./crypto-helper";
import { TallyResults } from "./tally-results";

function pemToBase64(pem: string) {
  return pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, ""); // Remove spaces, newlines, etc.
}

function base64StringToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const importPublicKey = async (pemKey: string) => {
  const base64Key = pemToBase64(pemKey);
  const keyBuffer = base64StringToArrayBuffer(base64Key);

  return window.crypto.subtle.importKey(
    "spki",
    keyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
};

const WebSocketComponent = () => {
  const [info, setInfo] = React.useState<Info | null>(null);
  const [socket, setSocket] = useState<null | WebSocket>(null);
  const [tallyResults, setTallyResults] = useState<null | TallyResult>(null);

  // Connect to WebSocket server
  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8080");

    newSocket.onopen = () => {
      console.log("Connected to the WebSocket server");
    };

    newSocket.onmessage = ({ data }) => {
      try {
        const jData = JSON.parse(data);
        if ("publicKey" in jData && "title" in jData) {
          console.log("hello!", jData.title, jData.publicKey);

          importPublicKey(jData.publicKey)
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

import * as WebSocket from "ws";
import * as crypto from "crypto";

//console.log(WebSocket);

// global variables

const uidHashes = [];
const encryptedVotes = [];

const tallyVote = async (encryptedVotes, privateKey) => {
  const t0 = new Date().getTime();

  const tally = {};
  const pvotes = encryptedVotes.map(async (encVote) => {
    return decryptWithPrivateKey(privateKey, encVote);
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

// Function to generate RSA key pair
async function generateKeyPair() {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair(
      "rsa",
      {
        modulusLength: 2048, // Can be 1024, 2048, or 4096
        publicKeyEncoding: {
          type: "spki", // Recommended to be 'spki' for public key
          format: "pem", // 'pem' or 'der' format
        },
        privateKeyEncoding: {
          type: "pkcs8", // Recommended to be 'pkcs8' for private key
          format: "pem", // 'pem' or 'der' format
          cipher: "aes-256-cbc", // Optional encryption for private key
          passphrase, //: "your-secret-passphrase", // Optional passphrase for private key encryption
        },
      },
      (err, publicKey, privateKey) => {
        if (err) {
          reject(err);
        } else {
          resolve({ publicKey, privateKey });
        }
      }
    );
  });
}

const passphrase = "yoursecxretpassppharse";

function base64ToArrayBuffer(base64) {
  // Create a buffer from the base64 encoded string
  const buffer = Buffer.from(base64, "base64");

  // Convert the buffer to an ArrayBuffer
  const arrayBuffer = new Uint8Array(buffer).buffer;

  return arrayBuffer;
}

function pemToBase64(pemKey) {
  // Extract the base64 encoded part of the PEM formatted key
  const base64Key = pemKey
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s+/g, ""); // Remove spaces, newlines, etc.
  return base64Key;
}

function arrayBufferToBase64String(buffer) {
  return pemToBase64(Buffer.from(buffer).toString());
}

const exportPublicKey = async (publicKey) => {
  // Assuming publicKey is a PEM-encoded string or a Buffer
  // Convert it to Base64
  const publicKeyString = arrayBufferToBase64String(publicKey);
  return publicKeyString;
};

function decryptWithPrivateKey(encryptedPrivateKey, ciphertext) {
  const decryptedPrivateKey = crypto.createPrivateKey({
    key: encryptedPrivateKey,
    passphrase,
    format: "pem",
    type: "pkcs8",
  });

  // Convert your ArrayBuffer or Buffer to a Buffer if it's not already
  const bufferCiphertext = Buffer.from(ciphertext);

  // Decrypt the ciphertext
  const decrypted = crypto.privateDecrypt(
    {
      key: decryptedPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    bufferCiphertext
  );

  return decrypted.toString();
}

const main = async () => {
  const keyPair = await generateKeyPair();
  const publicKeyString = await exportPublicKey(keyPair.publicKey);
  const title = "My Vote";

  const wss = new WebSocket.WebSocketServer({ port: 8080 });

  // Keep track of all connected clients
  const clients = new Set();

  wss.on("connection", function connection(ws) {
    clients.add(ws);
    console.log("A new client connected!");
    ws.send(
      JSON.stringify({
        publicKey: publicKeyString,
        title,
        message: "connection initiated",
      })
    );

    ws.on("message", function incoming(message) {
      //console.log("received: %s", message);

      // Echo the message back to the client
      ws.send(`Server received: ${message}`);

      try {
        const jMessage = JSON.parse(message);
        if ("uidHash" in jMessage && "encryptedVote" in jMessage) {
          ws.send("server received vote!");

          // check if already voted
          if (uidHashes.includes(jMessage.uidHash)) {
            console.warn("already voted");
            ws.send(JSON.stringify({ error: "voter already voted" }));
            return;
          }

          uidHashes.push(jMessage.uidHash);

          const encrypted = base64ToArrayBuffer(jMessage.encryptedVote);
          encryptedVotes.push(encrypted);

          // here return tally
          tallyVote(encryptedVotes, keyPair.privateKey).then((tally) => {
            Array.from(clients).forEach((client, i) => {
              client.send(JSON.stringify(tally));
            });
          });
        }
      } catch (err) {}
    });

    ws.on("close", () => console.log("Client disconnected"));
  });

  console.log("WebSocket server started on ws://localhost:8080");
};

main();

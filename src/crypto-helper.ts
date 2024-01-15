// Function to generate RSA key pair
export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048, // Can be 1024, 2048, or 4096
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: "SHA-256" },
    },
    true, // Whether the key is extractable
    ["encrypt", "decrypt"]
  ); // Usage of the keys

  return keyPair;
}

// Function to encrypt a message using a public key
export async function encryptMessage(publicKey: CryptoKey, message: string) {
  const encodedMessage = new TextEncoder().encode(message);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encodedMessage
  );

  return encrypted;
}

// Function to decrypt a message using a private key
export async function decryptMessage(
  privateKey: CryptoKey,
  encrypted: BufferSource
) {
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

// Function to add random padding to a message
export function addRandomPadding(message: string, paddingLength = 32) {
  const padding = window.crypto.getRandomValues(new Uint8Array(paddingLength));
  const paddedMessage = `${message}|${Array.from(padding)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
  return paddedMessage;
}

// Function to remove padding from a decrypted message
export function removeRandomPadding(decryptedMessage: string) {
  return decryptedMessage.split("|")[0];
}

export const toBase64 = (encrypted: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(encrypted)));

// Example usage
async function e2e() {
  try {
    // Generate key pair
    const keyPair = await generateKeyPair();

    // Encrypt a message
    const message = "Hello, World!";
    console.log("Original Message:", message);
    // Add random padding
    const paddedMessage = addRandomPadding(message);
    const encrypted = await encryptMessage(keyPair.publicKey, paddedMessage);

    // Convert ArrayBuffer to Base64 for demonstration
    console.log("Encrypted Message:", toBase64(encrypted));

    // Decrypt the message
    const decryptedWithPadding = await decryptMessage(
      keyPair.privateKey,
      encrypted
    );
    // Remove the padding
    const decrypted = removeRandomPadding(decryptedWithPadding);

    console.log("Decrypted Message:", decrypted);
  } catch (e) {
    console.error("Error:", e);
  }
}

export const exportPublicKey = async (publicKey: CryptoKey) => {
  // Export the public key as a string
  const exportedPublicKey = await window.crypto.subtle.exportKey(
    "spki",
    publicKey
  );
  const publicKeyString = arrayBufferToBase64String(exportedPublicKey);

  return publicKeyString;
};

export const exportKeyPair = async (
  keyPair: CryptoKeyPair
): Promise<{
  publicKeyString: string;
  privateKeyString: string;
}> => {
  const publicKeyString = await exportPublicKey(keyPair.publicKey);

  // Export the private key as a string
  const exportedPrivateKey = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );
  const privateKeyString = arrayBufferToBase64String(exportedPrivateKey);

  return { publicKeyString, privateKeyString };
};

export const importKeyPair = async (
  publicKeyString: string,
  privateKeyString: string
): Promise<CryptoKeyPair> => {
  // Convert Base64 string to ArrayBuffer
  const publicKeyBuffer = base64StringToArrayBuffer(publicKeyString);
  const privateKeyBuffer = base64StringToArrayBuffer(privateKeyString);

  // Import the public key
  const importedPublicKey = await window.crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );

  // Import the private key
  const importedPrivateKey = await window.crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );

  return { publicKey: importedPublicKey, privateKey: importedPrivateKey };
};

generateKeyPair().then((keypair) => exportKeyPair(keypair).then(console.log));

// Helper function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64String(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  let byteString = "";

  for (let i = 0; i < byteArray.byteLength; i++) {
    byteString += String.fromCharCode(byteArray[i]);
  }

  return btoa(byteString);
}

// Helper function to convert Base64 string to ArrayBuffer
function base64StringToArrayBuffer(base64String: string) {
  const binaryString = atob(base64String);
  const byteArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }
  return byteArray.buffer;
}

export function firstAndLastChars(str: string, chars: number = 6) {
  if (str.length < chars * 2) {
    throw new Error("String must be at least " + chars + " characters long");
  }

  const firstThree = str.substring(0, chars);
  const lastThree = str.substring(str.length - chars);

  return firstThree + " ... " + lastThree;
}

export function generateFriendlyString(length: number = 10) {
  const vowels = "aeiou";
  const consonants = "bcdfghjklmnpqrstvwxyz";
  let result = "";

  const getRandomChar = (str: string) =>
    str[Math.floor(Math.random() * str.length)];

  for (let i = 0; i < length; i++) {
    result += i % 2 === 0 ? getRandomChar(consonants) : getRandomChar(vowels);
  }

  return result;
}

export async function computeHash(str: string) {
  // Encode the string into bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  // Compute the hash
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);

  // Convert the hash to a hexadecimal string
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function pemToBase64(pem: string) {
  return pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, ""); // Remove spaces, newlines, etc.
}

export function base64StringToArrayBuffer(base64: string) {
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

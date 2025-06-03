import { Base64 } from 'js-base64';
import scryptJs from 'scrypt-js';
const { scrypt } = scryptJs as { scrypt: typeof import('scrypt-js').scrypt };

const toB64 = (buf: ArrayBuffer | Uint8Array): string => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Base64.fromUint8Array(bytes);
};

const fromB64 = (b64: string): Uint8Array => {
  return Base64.toUint8Array(b64);
};

// samo pri registraciji
export const makeSalt = (): string => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return toB64(salt);
};

export async function deriveKey(password: string, saltB64: string) {
  if (!saltB64) {
    throw new Error('Missing salt – cannot derive key');
  }

  const salt = fromB64(saltB64);
  const passBytes = new TextEncoder().encode(password);

  // scrypt parameters: N=2^15, r=8, p=1
  const N = 1 << 15;
  const r = 8;
  const p = 1;
  const dkLen = 32;
  const derived = await scrypt(passBytes, salt, N, r, p, dkLen);

  const key = await crypto.subtle.importKey(
    'raw',
    derived,
    { name: 'AES-KW', length: 256 },
    true,
    ['wrapKey', 'unwrapKey'],
  );

  return { salt: saltB64, key };
}

export const generateDek = () =>
  crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );

export const wrapDek = async (dek: CryptoKey, kek: CryptoKey) => {
  const buf = await crypto.subtle.wrapKey('raw', dek, kek, 'AES-KW');
  return toB64(buf);
};

export const unwrapDek = (b64: string, kek: CryptoKey) =>
  crypto.subtle.unwrapKey(
    'raw',
    fromB64(b64),
    kek,
    'AES-KW',
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );

export async function aesGcmEncrypt(plaintext: string, dek: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    dek,
    new TextEncoder().encode(plaintext),
  );

  return {
    iv: toB64(iv),
    blob: toB64(cipherBuf),
  };
}

export async function aesGcmDecrypt(
  b64Blob: string,
  b64Iv: string,
  dek: CryptoKey,
) {
  const iv = fromB64(b64Iv);
  const buf = fromB64(b64Blob);

  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    dek,
    buf,
  );

  return new TextDecoder().decode(plain);
}

const SALT_KEY = 'e2ee-salt';

export async function saveSalt(saltB64: string) {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(SALT_KEY, saltB64);
  }
}

export async function loadSalt(): Promise<string | null> {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(SALT_KEY);
}

export async function clearSalt() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(SALT_KEY);
  }
}
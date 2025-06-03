import { openDB } from 'idb';

const toB64 = (buf: ArrayBuffer | Uint8Array): string => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes));
};

const fromB64 = (b64: string): Uint8Array =>
  Uint8Array.from(atob(b64), c => c.charCodeAt(0));

// samo pri registraciji
export const makeSalt = (): string => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return toB64(salt);
};

export async function deriveKey(password: string, saltB64: string) {
  if (!saltB64) {
    throw new Error('Missing PBKDF2 salt – cannot derive key');
  }

  const salt = fromB64(saltB64);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 200_000,
      hash: 'SHA-256',
    },
    keyMaterial,
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

// ipak samo SALT, demo je bilo privremeno ime al se bojim promijeniti
const DB    = 'e2ee-demo';
const STORE = 'keys';
const KEY   = 'salt';

async function getDB() {
  return openDB(DB, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    },
  });
}

export async function saveSalt(saltB64: string) {
  const db = await getDB();
  const tx = db.transaction(STORE, 'readwrite');
  await tx.store.put(saltB64, KEY);
  await tx.done;
}

export async function loadSalt(): Promise<string | null> {
  const db = await getDB();
  const tx = db.transaction(STORE, 'readonly');
  const salt = await tx.store.get(KEY);
  await tx.done;
  return salt ?? null;
}

export async function clearSalt() {
  const db = await getDB();
  const tx = db.transaction(STORE, 'readwrite');
  await tx.store.delete(KEY);
  await tx.done;
}

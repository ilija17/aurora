export async function deriveKey(password: string, saltB64?: string) {
  const salt = saltB64
    ? Uint8Array.from(atob(saltB64), c => c.charCodeAt(0))
    : crypto.getRandomValues(new Uint8Array(16))

  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    { name: 'PBKDF2' }, false, ['deriveKey']
  )

  return {
    salt: btoa(String.fromCharCode(...salt)),
    key: await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 200_000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-KW', length: 256 },
      true, ['wrapKey', 'unwrapKey']
    )
  }
}

export const generateDek = () =>
  crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])

export const wrapDek = (dek: CryptoKey, kek: CryptoKey) =>
  crypto.subtle.wrapKey('raw', dek, kek, 'AES-KW')
    .then(buf => btoa(String.fromCharCode(...new Uint8Array(buf))))

export const unwrapDek = (b64: string, kek: CryptoKey) =>
  crypto.subtle.unwrapKey(
    'raw',
    Uint8Array.from(atob(b64), c => c.charCodeAt(0)),
    kek,
    'AES-KW',
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  export const makeSalt = () =>
  btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))))

  export async function aesGcmEncrypt (plaintext: string, dek: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    dek,
    new TextEncoder().encode(plaintext)
  )

  return {
    iv:  btoa(String.fromCharCode(...iv)),
    blob: btoa(String.fromCharCode(...new Uint8Array(cipherBuf)))
  }
}

export async function aesGcmDecrypt (b64Blob: string, b64Iv: string, dek: CryptoKey) {
  const iv  = Uint8Array.from(atob(b64Iv),  c => c.charCodeAt(0))
  const buf = Uint8Array.from(atob(b64Blob), c => c.charCodeAt(0))
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, dek, buf)
  return new TextDecoder().decode(plain)
}
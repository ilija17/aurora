import { Base64 } from 'js-base64'

const KEY_KEK = 'kek'
const KEY_DEK = 'dek'

const store: Record<string, CryptoKey | undefined> = {}

async function put(key: string, value: CryptoKey) {
  store[key] = value
  if (typeof sessionStorage !== 'undefined') {
    const raw = await crypto.subtle.exportKey('raw', value)
    const b64 = Base64.fromUint8Array(new Uint8Array(raw))
    sessionStorage.setItem(key, b64)
  }
}

async function get(key: string): Promise<CryptoKey | null> {
  if (store[key]) return store[key]!

  if (typeof sessionStorage === 'undefined') return null

  const b64 = sessionStorage.getItem(key)
  if (!b64) return null

  const raw = Base64.toUint8Array(b64)
  const alg = key === KEY_KEK ? { name: 'AES-KW', length: 256 } : { name: 'AES-GCM', length: 256 }
  const usage = key === KEY_KEK ? ['wrapKey', 'unwrapKey'] : ['encrypt', 'decrypt']
  const cryptoKey = await crypto.subtle.importKey('raw', raw, alg, true, usage)

  store[key] = cryptoKey
  return cryptoKey
}

async function del(key: string) {
  delete store[key]
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(key)
  }
}

export const saveKek  = (k: CryptoKey) => put(KEY_KEK, k)
export const loadKek  = () => get(KEY_KEK)
export const clearKek = () => del(KEY_KEK)

export const saveDek  = (d: CryptoKey) => put(KEY_DEK, d)
export const loadDek  = () => get(KEY_DEK)
export const clearDek = () => del(KEY_DEK)

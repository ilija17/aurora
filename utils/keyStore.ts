const KEY_KEK = 'kek'
const KEY_DEK = 'dek'

const store: Record<string, CryptoKey | undefined> = {}

async function put(key: string, value: CryptoKey) {
  store[key] = value
}

async function get(key: string): Promise<CryptoKey | null> {
  return store[key] ?? null
}

async function del(key: string) {
  delete store[key]
}

export const saveKek  = (k: CryptoKey) => put(KEY_KEK, k)
export const loadKek  = () => get(KEY_KEK)
export const clearKek = () => del(KEY_KEK)

export const saveDek  = (d: CryptoKey) => put(KEY_DEK, d)
export const loadDek  = () => get(KEY_DEK)
export const clearDek = () => del(KEY_DEK)

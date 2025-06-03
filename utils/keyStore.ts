import { openDB, type IDBPDatabase } from 'idb'

type DBHandle = IDBPDatabase<unknown>

const DB    = 'e2ee-demo'
const STORE = 'keys'
const KEY_KEK = 'kek'
const KEY_DEK = 'dek'

const isClient = typeof indexedDB !== 'undefined'
async function getDB(): Promise<DBHandle | null> {
  if (!isClient) return null
  return openDB(DB, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
  })
}

async function put(key: string, value: CryptoKey) {
  const db = await getDB()
  if (!db) return
  const tx = db.transaction(STORE, 'readwrite')
  await tx.store.put(value, key)
  await tx.done
}

async function get(key: string): Promise<CryptoKey | null> {
  const db = await getDB()
  if (!db) return null
  const tx  = db.transaction(STORE, 'readonly')
  const val = await tx.store.get(key)
  await tx.done
  return val ?? null
}

async function del(key: string) {
  const db = await getDB()
  if (!db) return
  const tx = db.transaction(STORE, 'readwrite')
  await tx.store.delete(key)
  await tx.done
}

export const saveKek   = (k: CryptoKey)        => put(KEY_KEK, k)
export const loadKek   = () => get(KEY_KEK)
export const clearKek  = () => del(KEY_KEK)

export const saveDek   = (d: CryptoKey)        => put(KEY_DEK, d)
export const loadDek   = () => get(KEY_DEK)
export const clearDek  = () => del(KEY_DEK)

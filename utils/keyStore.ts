import { openDB } from 'idb'

const DB = 'e2ee-demo'
const STORE = 'keys'

async function getDB () {
  return openDB(DB, 1, {
    upgrade (db) {
      if (!db.objectStoreNames.contains(STORE))
        db.createObjectStore(STORE)
    }
  })
}

export async function saveKek (kek: CryptoKey) {
  const db = await getDB()
  const tx = db.transaction(STORE, 'readwrite')
  await tx.store.put(kek, 'kek')
  await tx.done
}

export async function loadKek (): Promise<CryptoKey | null> {
  const db = await getDB()
  const tx = db.transaction(STORE, 'readonly')
  const kek = await tx.store.get('kek')
  await tx.done
  return kek ?? null
}

export async function clearKek () {
  const db = await getDB()
  const tx = db.transaction(STORE, 'readwrite')
  await tx.store.delete('kek')
  await tx.done
}

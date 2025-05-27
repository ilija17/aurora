import { ref, computed } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import {
  deriveKey,
  generateDek,
  wrapDek,
  unwrapDek,
  makeSalt,
  aesGcmEncrypt,
  aesGcmDecrypt
} from '~/utils/cryptoHelpers'
import { loadKek, saveKek } from '~/utils/keyStore'

export const useDek = () => {
  const sb = useSupabaseClient()
  const user = useSupabaseUser()

  const dek = ref<CryptoKey | null>(null)
  const kek = ref<CryptoKey | null>(null)
  const unlocked = computed(() => dek.value !== null)

  async function unlock(password?: string) {
    if (!user.value) throw new Error('no session')
    if (dek.value) return
    if (!kek.value) {
      kek.value = await loadKek()
    }
    if (!kek.value) {
      if (!password) throw new Error('need password first time')
      const { key, salt } = await deriveKey(password)
      password = undefined // mici je iz RAM
      kek.value = key
      await saveKek(kek.value)
      await sb.from('profiles').update({ dek_salt: salt }).eq('id', user.value.id)
    }
    const { data: profile, error } = await sb
      .from('profiles')
      .select('wrapped_dek')
      .eq('id', user.value.id)
      .single()
    if (error) throw error
    if (!profile.wrapped_dek) {
      dek.value = await generateDek()
      const wrapped = await wrapDek(dek.value, kek.value!)
      await sb.from('profiles').update({ wrapped_dek: wrapped }).eq('id', user.value.id)
    } else {
      dek.value = await unwrapDek(profile.wrapped_dek, kek.value!)
    }
  }

  function lock() {
    dek.value = null
  }

  async function seal<T>(payload: T) {
    if (!dek.value) throw new Error('unlock first')
    const { iv, blob } = await aesGcmEncrypt(JSON.stringify(payload), dek.value)
    return { enc_iv: iv, enc_blob: blob }
  }

  async function open<T>(row: { enc_iv: string; enc_blob: string }): Promise<T> {
    if (!dek.value) throw new Error('unlock first')
    const json = await aesGcmDecrypt(row.enc_blob, row.enc_iv, dek.value)
    return JSON.parse(json) as T
  }

  return { dek, unlocked, unlock, lock, seal, open }
}

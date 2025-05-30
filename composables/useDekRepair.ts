import { useSupabaseClient, useSupabaseUser } from '#imports'
import { deriveKey } from '~/utils/cryptoHelpers'
import { saveKek } from '~/utils/keyStore'

export const useDekRepair = () => {
  const sb   = useSupabaseClient()
  const user = useSupabaseUser()

  async function repairIfMissing (password: string): Promise<void> {
    if (!user.value) throw new Error('no session')

    //ako postoji ništa ne napravit
    const { data: profile, error } = await sb
      .from('profiles')
      .select('dek_salt')
      .eq('id', user.value.id)
      .single()

    if (error) throw error
    if (profile.dek_salt) return

    // ako ne postoji derivirat od lozinke
    const { key, salt } = await deriveKey(password)

    await sb.from('profiles')
      .update({ dek_salt: salt })
      .eq('id', user.value.id)
      .single()
      .throwOnError()

    await saveKek(key)
    console.log('[useDekRepair] dek_salt repaired for user', user.value.id)
  }

  return { repairIfMissing }
}

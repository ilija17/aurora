// composables/useDekRepair.ts
import { useSupabaseClient } from '#imports';
import {
  makeSalt, deriveKey, generateDek, wrapDek, saveSalt
} from '~/utils/cryptoHelpers';
import { startDecryptAnimation, stopDecryptAnimation } from '~/composables/useCryptoAnimation'

export function useDekRepair() {
  const supabase = useSupabaseClient();

  async function repairIfMissing(
    password: string,
    saltB64: string | null,
    wrappedDekB64: string | null
  ) {
    startDecryptAnimation()
    try {
    if (saltB64 && wrappedDekB64) {
      await saveSalt(saltB64);
      return;
    }

    const salt = makeSalt();
    const { key: kek } = await deriveKey(password, salt);
    const dek          = await generateDek();
    const wrappedDek   = await wrapDek(dek, kek);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No signed-in user');

    await supabase.from('profiles').update({
      dek_salt:    salt,
      wrapped_dek: wrappedDek,
      dek_wrap_algo: 'AES-KW'      // optional
    })
    .eq('id', user.id);


    await saveSalt(salt);
    } finally {
      stopDecryptAnimation()
    }
  }

  return { repairIfMissing };
}

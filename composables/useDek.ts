import { ref, computed } from 'vue';
import { useSupabaseClient, useSupabaseUser, useRouter, useRoute } from '#imports';
import {
  makeSalt,
  deriveKey,
  generateDek,
  wrapDek, unwrapDek,
  aesGcmEncrypt, aesGcmDecrypt,
  loadSalt, saveSalt
} from '~/utils/cryptoHelpers';

import {
  saveKek, loadKek, clearKek,
  saveDek, loadDek, clearDek
} from '~/utils/keyStore'

import { startDecryptAnimation, stopDecryptAnimation } from '~/composables/useCryptoAnimation'


const kek = ref<CryptoKey | null>(null);
const dek = ref<CryptoKey | null>(null);
const currentSalt = ref<string | null>(null);

;(async () => {
  const cachedKek = await loadKek()
  if (cachedKek) {
    kek.value = cachedKek
  }

  const cachedDek = await loadDek()
  if (cachedDek) {
    dek.value = cachedDek
  }
})()

export const useDek = () => {
  const sb   = useSupabaseClient();
  const user = useSupabaseUser();
  const router = useRouter();
  const route = useRoute();
  
  const unlocked = computed(() => dek.value !== null);
  const hasKek = computed(() => kek.value !== null);

  async function storeKek(password: string, salt: string) {
    const { key } = await deriveKey(password, salt);
    kek.value = key;
    await saveKek(kek.value)
    currentSalt.value = salt;
  }

  function clearSession() {
    kek.value = null;
    dek.value = null;
    currentSalt.value = null;
  }

  async function unlock(password?: string) {
    startDecryptAnimation()
    try {
      if (!user.value) throw new Error('no session')
      if (dek.value) return

    const { data: profile, error } = await sb
      .from('profiles')
      .select('dek_salt, wrapped_dek')
      .eq('id', user.value.id)
      .single();
    
    if (error) throw error;

    let salt: string | null = profile.dek_salt ?? null;
    let wrappedDek: string | null = profile.wrapped_dek ?? null;

    if (!salt) {
      salt = await loadSalt();
    }

    if (!salt) {
      if (!password) throw new Error('Password required for first-time setup');
      
      salt = makeSalt();
      const { key: newKek } = await deriveKey(password, salt);
      dek.value = await generateDek();
      wrappedDek = await wrapDek(dek.value, newKek);
      
      // spremi u db
      await sb.from('profiles')
        .update({
          dek_salt: salt,
          wrapped_dek: wrappedDek,
          dek_wrap_algo: 'AES-KW'
        })
        .eq('id', user.value.id);
      
      await saveSalt(salt);
      kek.value = newKek;
      currentSalt.value = salt;
      
      return;
    }

    if (kek.value && currentSalt.value === salt) {
      if (!wrappedDek) {
        dek.value = await generateDek();
        wrappedDek = await wrapDek(dek.value, kek.value);
        await sb.from('profiles')
          .update({ wrapped_dek: wrappedDek })
          .eq('id', user.value.id);
        await saveDek(dek.value);
      } else {
        dek.value = await unwrapDek(wrappedDek, kek.value);
        await saveDek(dek.value);
      }
      return;
    }

    if (!password) {
      router.push({ path: '/unlock', query: { redirect: route.fullPath } });
      throw new Error('Password required to unlock');
    }
    
    const { key: derivedKek } = await deriveKey(password, salt);

    await saveSalt(salt);

    try {
      if (!wrappedDek) {
        dek.value = await generateDek();
        wrappedDek = await wrapDek(dek.value, derivedKek);
        await saveDek(dek.value);
        await sb.from('profiles')
          .update({ wrapped_dek: wrappedDek })
          .eq('id', user.value.id);
      } else {
        dek.value = await unwrapDek(wrappedDek, derivedKek)
        await saveDek(dek.value);
      }

      kek.value = derivedKek;
      currentSalt.value = salt;
      await saveKek(derivedKek)

    } catch (err) {
      await clearKek();
      kek.value = null;
      dek.value = null;
      currentSalt.value = null;
      throw new Error('Incorrect password');
    }
  } finally {
    stopDecryptAnimation()
  }
  }

  function lock() {
    dek.value = null;
  }

  async function quickUnlock() {
    startDecryptAnimation()
    try {
      if (!user.value) throw new Error('no session');
      if (dek.value) return;
      if (!kek.value) throw new Error('No cached KEK - full unlock required');

      const { data: profile, error } = await sb
        .from('profiles')
        .select('wrapped_dek')
        .eq('id', user.value.id)
        .single();

      if (error) throw error;
      if (!profile.wrapped_dek) throw new Error('No wrapped DEK found');

      dek.value = await unwrapDek(profile.wrapped_dek, kek.value);
    } finally {
      stopDecryptAnimation()
    }
  }

  async function seal<T>(payload: T) {
    if (!dek.value) {
      if (kek.value) {
        await quickUnlock();
      } else {
        if (!opts.suppressRedirect) {
          router.push({ path: '/unlock', query: { redirect: route.fullPath } });
        }
        throw new Error('unlock first');
      }
    }
    
    const { iv, blob } = await aesGcmEncrypt(JSON.stringify(payload), dek.value);
    return { enc_iv: iv, enc_blob: blob };
  }

  async function open<T>(row: { enc_iv: string; enc_blob: string }): Promise<T> {
    startDecryptAnimation()
    try {
      if (!dek.value) {
        if (kek.value) {
          await quickUnlock();
        } else {
          if (!opts.suppressRedirect) {
            router.push({ path: '/unlock', query: { redirect: route.fullPath } });
          }
          throw new Error('unlock first');
        }
      }

      const json = await aesGcmDecrypt(row.enc_blob, row.enc_iv, dek.value);
      return JSON.parse(json) as T;
    } finally {
      stopDecryptAnimation()
    }
  }

  async function updateDekPassword(
    newPassword: string,
    opts: { suppressRedirect?: boolean } = {}
  ) {
    if (!user.value) throw new Error('no session');

    if (!dek.value) {
      if (kek.value) {
        await quickUnlock();
      } else {
        if (!opts.suppressRedirect) {
          router.push({ path: '/unlock', query: { redirect: route.fullPath } });
        }
        throw new Error('unlock first');
      }
    }

    if (!currentSalt.value) {
      throw new Error('Missing salt');
    }

    const { key: newKek } = await deriveKey(newPassword, currentSalt.value);
    const wrappedDek      = await wrapDek(dek.value!, newKek);

    const { error } = await sb
      .from('profiles')
      .update({ wrapped_dek: wrappedDek })
      .eq('id', user.value.id);

    if (error) throw error;

    kek.value = newKek;
    await saveKek(newKek);
  }

  return { 
    dek,
    kek,
    unlocked, 
    hasKek,
    unlock, 
    quickUnlock,
    lock, 
    seal, 
    open, 
    storeKek,
    clearSession,
    updateDekPassword
  };
};
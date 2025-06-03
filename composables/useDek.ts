import { ref, computed } from 'vue';
import { useSupabaseClient, useSupabaseUser } from '#imports';
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


const kek = ref<CryptoKey | null>(null);
const dek = ref<CryptoKey | null>(null);
const currentSalt = ref<string | null>(null);

;(async () => {
  const cachedKek = await loadKek()
  if (cachedKek) {
    kek.value = cachedKek
    console.log('[DEK] KEK restored from IndexedDB')
  }

  const cachedDek = await loadDek()
  if (cachedDek) {
    dek.value = cachedDek
    console.log('[DEK] DEK restored from IndexedDB')
  }
})()

export const useDek = () => {
  const sb   = useSupabaseClient();
  const user = useSupabaseUser();
  
  const unlocked = computed(() => dek.value !== null);
  const hasKek = computed(() => kek.value !== null);

  async function storeKek(password: string, salt: string) {
    const { key } = await deriveKey(password, salt);
    kek.value = key;
    await saveKek(kek.value)
    currentSalt.value = salt;
    console.log('[DEK] KEK stored in memory for session');
  }

  function clearSession() {
    kek.value = null;
    dek.value = null;
    currentSalt.value = null;
    console.log('[DEK] Session cleared');
  }

  async function unlock(password?: string) {
    if (!user.value) throw new Error('no session');
    if (dek.value) return;

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
      
      console.log('[DEK] First-time setup complete');
      return;
    }

    if (kek.value && currentSalt.value === salt) {
      console.log('[DEK] Using cached KEK');
      
      if (!wrappedDek) {
        dek.value = await generateDek();
        wrappedDek = await wrapDek(dek.value, kek.value);
        await sb.from('profiles')
          .update({ wrapped_dek: wrappedDek })
          .eq('id', user.value.id);
      } else {
        dek.value = await unwrapDek(wrappedDek, kek.value);
      }
      return;
    }

    if (!password) throw new Error('Password required to unlock');
    
    const { key: derivedKek } = await deriveKey(password, salt);
    
    await saveSalt(salt);
    kek.value = derivedKek;
    currentSalt.value = salt;
    await saveKek(derivedKek) 

    if (!wrappedDek) {
      dek.value = await generateDek();
      wrappedDek = await wrapDek(dek.value, kek.value);
      await saveDek(dek.value)
      await sb.from('profiles')
        .update({ wrapped_dek: wrappedDek })
        .eq('id', user.value.id);
    } else {
      dek.value = await unwrapDek(wrappedDek, kek.value);
    }
    
    console.log('[DEK] Unlocked with password');
  }

  function lock() {
    dek.value = null;
    console.log('[DEK] DEK locked (KEK preserved)');
  }

  async function quickUnlock() {
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
    console.log('[DEK] Quick unlock successful');
  }

  async function seal<T>(payload: T) {
    if (!dek.value) {
      if (kek.value) {
        await quickUnlock();
      } else {
        throw new Error('unlock first');
      }
    }
    
    const { iv, blob } = await aesGcmEncrypt(JSON.stringify(payload), dek.value);
    return { enc_iv: iv, enc_blob: blob };
  }

  async function open<T>(row: { enc_iv: string; enc_blob: string }): Promise<T> {
    if (!dek.value) {
      if (kek.value) {
        await quickUnlock();
      } else {
        throw new Error('unlock first');
      }
    }
    
    const json = await aesGcmDecrypt(row.enc_blob, row.enc_iv, dek.value);
    return JSON.parse(json) as T;
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
    clearSession
  };
};
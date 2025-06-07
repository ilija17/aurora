import { ref } from 'vue'
import { useDek } from '~/composables/useDek'

interface RawDiaryRow {
  id: number
  iv: string
  data: string
  created_at?: string
}

interface FinalizedDiaryEntry {
  id: number
  payload: {
    title: string
    body: string
    created_at?: string
  }
}

export function useDiaryEntries() {
  const rawEntries = ref<RawDiaryRow[]>([])
  const finalizedEntries = ref<FinalizedDiaryEntry[]>([])
  const title = ref('')
  const body = ref('')
  const isSubmitting = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const globalError = ref<string | null>(null)

  const { unlock, unlocked, open, seal } = useDek()

  async function fetchRawDiaryEntries() {
    try {
      const response = await $fetch('/api/diary-entries')
      rawEntries.value = response.data || []
    } catch (fetchError: any) {
      throw new Error(fetchError.message || 'Failed to fetch entries')
    }
  }

  async function fetchFinalizedDiaryEntries(password?: string) {
    loading.value = true
    error.value = null
    globalError.value = null
    
    try {
      // Try to unlock with cached DEK first, then password if provided
      if (!unlocked.value) {
        if (password) {
          await unlock(password)
        } else {
          // Try to use cached DEK without password
          await unlock()
        }
      }
      
      if (!unlocked.value) {
        throw new Error('Encryption key not unlocked - password required')
      }

      await fetchRawDiaryEntries()

      const decrypted = await Promise.all(
        rawEntries.value.map(async row => ({
          id: row.id,
          payload: {
            ...await open({ enc_iv: row.iv, enc_blob: row.data }),
            created_at: row.created_at,
          }
        }))
      )

      finalizedEntries.value = decrypted
    } catch (e: any) {
      const errorMessage = e.message || String(e)
      error.value = errorMessage
      globalError.value = errorMessage
    } finally {
      loading.value = false
    }
  }

  async function submitDiaryEntry(id?: number) {
    isSubmitting.value = true
    error.value = null
    
    try {
      if (!unlocked.value) {
        throw new Error('Encryption key not unlocked')
      }

      const sealed = await seal({ title: title.value, body: body.value })

      const payload = {
        ciphertext: sealed.enc_blob,
        iv: sealed.enc_iv,
      }

      if (id) {
        // Update existing entry
        await $fetch(`/api/diary-entry/${id}`, {
          method: 'PATCH',
          body: payload
        })
      } else {
        // Create new entry
        await $fetch('/api/diary-entry', {
          method: 'POST',
          body: payload
        })
      }

      // Refresh the entries list
      await fetchFinalizedDiaryEntries()
    } catch (e: any) {
      error.value = e.message || String(e)
    } finally {
      isSubmitting.value = false
    }
  }

  async function deleteDiaryEntry(id: number) {
    error.value = null
    
    try {
      await $fetch(`/api/diary-entry/${id}`, {
        method: 'DELETE'
      })
      
      // Refresh the entries list
      await fetchFinalizedDiaryEntries()
    } catch (e: any) {
      error.value = e.message || String(e)
    }
  }

  return {
    finalizedEntries,
    rawEntries,
    loading,
    error,
    globalError,
    title,
    body,
    isSubmitting,
    unlocked,
    unlock,
    fetchFinalizedDiaryEntries,
    submitDiaryEntry,
    deleteDiaryEntry,
  }
}
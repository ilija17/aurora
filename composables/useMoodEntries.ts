import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
import { useDek } from '~/composables/useDek'
import { usePublicContextData } from '~/composables/usePublicContextData'

export function useMoodEntries() {
  interface RawRow {
    id: number
    iv: string
    data: string
  }

  interface FinalizedMoodEntry {
    id: number
    payload: any
  }

  const supabase = useSupabaseClient()

  const rawEntries = ref<RawRow[]>([])
  const finalizedEntries = ref<FinalizedMoodEntry[]>([]) 
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { unlock, unlocked, open } = useDek()
  const { data: contextData, fetchContextData, enrichEntries } = usePublicContextData()

  async function fetchRawMoodEntries() {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from<RawRow>('mood_entries')
        .select('id, iv, data, entry_timestamp')

      if (fetchError) throw new Error(fetchError.message)
      rawEntries.value = data || []
    } catch (e: any) {
      error.value = e.message || String(e)
      console.error('[useMoodEntries:fetchRawMoodEntries]', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchFinalizedMoodEntries() {
    loading.value = true
    error.value = null

    try {
      await unlock()
      if (!unlocked.value) throw new Error('Encryption key not unlocked')

      if (!contextData.value) {
        await fetchContextData()
        if (!contextData.value) throw new Error('Failed to load context data')
      }

      await fetchRawMoodEntries()
      if (!rawEntries.value.length) {
        finalizedEntries.value = []
        return
      }

      const decrypted = await Promise.all(
        rawEntries.value.map(async row => ({
          id: row.id,
          payload: {
            ...await open({ enc_iv: row.iv, enc_blob: row.data }),
            entry_timestamp: row.entry_timestamp,
          }
        }))
      )

      finalizedEntries.value = await enrichEntries(decrypted)
    } catch (e: any) {
      error.value = e.message || String(e)
      console.error('[useMoodEntries:fetchFinalizedMoodEntries]', e)
    } finally {
      loading.value = false
    }
  }

  return {
    rawEntries,
    finalizedEntries,
    loading,
    error,
    fetchRawMoodEntries,
    fetchFinalizedMoodEntries
  }
}

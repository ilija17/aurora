interface PublicContextData {
  general_moods: any[]
  detailed_moods: any[]
  location_contexts: any[]
  social_contexts: any[]
}

const data = ref<PublicContextData | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)

export function usePublicContextData() {
  async function fetchContextData() {
    if (data.value) return

    loading.value = true
    error.value = null

    try {
      const response = await $fetch<PublicContextData>('/api/public-context')
      data.value = response
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch context data'
      console.error('[usePublicContextData]', err)
    } finally {
      loading.value = false
    }
  }

  function clearContextData() {
    data.value = null
    error.value = null
  }

  async function enrichEntries(
    entries: Array<{ id: number; payload: any }>
  ): Array<{ id: number; payload: any }> {
    try{
      if (!data.value) throw new Error('Context data not loaded')
      loading.value = true

      const { general_moods, detailed_moods, location_contexts, social_contexts } = data.value

      const generalMap  = Object.fromEntries(general_moods.map(m => [m.id, m]))
      const detailedMap = Object.fromEntries(detailed_moods.map(m => [m.id, m]))
      const locationMap = Object.fromEntries(location_contexts.map(m => [m.id, m]))
      const socialMap   = Object.fromEntries(social_contexts.map(m => [m.id, m]))

      return entries.map(entry => {
        const p = entry.payload
        return {
          id: entry.id,
          payload: {
            entry_timestamp: p.entry_timestamp,
            general_mood: generalMap[p.general_mood] || null,
            notes: p.notes,
            spotify_song_id: p.spotify_song_id ?? null,
            detailed_moods: (p.detailed_ids ?? []).map(id => detailedMap[id]).filter(Boolean),
            location_contexts: (p.location_ids ?? []).map(id => locationMap[id]).filter(Boolean),
            social_contexts: (p.social_ids ?? []).map(id => socialMap[id]).filter(Boolean)
          }
        }
      })
    }finally{
      loading.value = false
    }
    
  }

  return {
    data,
    error,
    loading,
    fetchContextData,
    clearContextData,
    enrichEntries
  }
}
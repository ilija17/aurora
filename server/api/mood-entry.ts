// server/api/mood-entry.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient }          from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)  

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const {
    selectedMood,
    detailedMoodContext,
    locationContext,
    socialContext,
    notes,
    spotifySongId
  } = await readBody(event) as {
    selectedMood:         number
    detailedMoodContext:  number[]
    locationContext:      number[]
    socialContext:        number[]
    notes:                string
    spotifySongId:        string|null
  }

  const { data, error } = await supabase.rpc('create_mood_entry', {
    p_user_id:          user.id,
    p_general_mood:     selectedMood,
    p_detailed_ids:     detailedMoodContext,
    p_location_ids:     locationContext,
    p_social_ids:       socialContext,
    p_notes:            notes,
    p_spotify_song_id:  spotifySongId
  })

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return data
})

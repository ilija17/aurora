import { defineEventHandler, createError } from 'h3'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const {
    public: { supabaseUrl },
    supabaseServiceRoleKey
  } = useRuntimeConfig()

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  // fetcha paralelno allegedly
  const [
    { data: generalMoods, error: generalError },
    { data: detailedMoods, error: detailedError },
    { data: locationContexts, error: locationError },
    { data: socialContexts, error: socialError }
  ] = await Promise.all([
    supabase.from('general_moods').select('*'),
    supabase.from('detailed_moods').select('*'),
    supabase.from('location_context').select('*'),
    supabase.from('social_context').select('*')
  ])

  const errors = [generalError, detailedError, locationError, socialError].filter(Boolean)
  if (errors.length > 0) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Database error: ' + errors.map(e => e.message).join('; ')
    })
  }

  return {
    general_moods: generalMoods,
    detailed_moods: detailedMoods,
    location_contexts: locationContexts,
    social_contexts: socialContexts
  }
})

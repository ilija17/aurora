import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient }          from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)  
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const { userUuid } = event.context.params as {
    userUuid: string
  }

  const { data, error } = await supabase.rpc('get_user_mood_entries', {
    _user_id: userUuid
  })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch user data' })
  }
  
  return data;
})

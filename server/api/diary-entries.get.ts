// server/api/diary-entries.get.ts
import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const { data, error } = await supabase
    .from('diary_entries')
    .select('id, iv, data, created_at')
    .eq('user_id', user.id)
    .order('id', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { data: data || [] }
})
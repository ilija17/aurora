import { defineEventHandler, getCookie, createError } from 'h3'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { getUserData } from '@/server/utils/getUserData'

export default defineEventHandler(async (event) => {
  const {
    public: { supabaseUrl },
    supabaseServiceRoleKey
  } = useRuntimeConfig()

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  const accessToken = getCookie(event, 'sb-access-token')
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  let userId: string
  try {
    const decoded = jwt.decode(accessToken) as any
    userId = decoded.sub
    if (!userId) throw new Error('No user ID in token')
  } catch (err) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, full_name, website, avatar_url, updated_at')
    .eq('id', userId)
    .single()
  if (profileError) {
    throw createError({ statusCode: 500, statusMessage: profileError.message })
  }

  const { data: diaryEntries, error: diaryError } = await supabase
    .from('diary_entries')
    .select('id, data, iv, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (diaryError) {
    throw createError({ statusCode: 500, statusMessage: diaryError.message })
  }

  const { data: notes, error: notesError } = await supabase
    .from('notes_enc')
    .select('id, ciphertext, salt, iv, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (notesError) {
    throw createError({ statusCode: 500, statusMessage: notesError.message })
  }

  let moodEntries: any[] = []
  try {
    moodEntries = await getUserData(supabase, userId)
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    profile,
    diaryEntries: diaryEntries || [],
    notes: notes || [],
    moodEntries: moodEntries || []
  }
})

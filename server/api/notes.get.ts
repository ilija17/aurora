import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  // Get all notes for this user
  const { data, error } = await supabase
    .from('notes_enc')
    .select('id, ciphertext, salt, iv, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Database error: ${error.message}` 
    })
  }

  return { notes: data || [] }
})
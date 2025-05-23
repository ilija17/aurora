import { defineEventHandler, getCookie, createError } from 'h3'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const {
    public: { supabaseUrl },
    supabaseServiceRoleKey
  } = useRuntimeConfig()

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  // Get user from JWT token
  const accessToken = getCookie(event, 'sb-access-token')
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  let userId: string
  try {
    const decoded = jwt.decode(accessToken) as any
    userId = decoded.sub
    if (!userId) {
      throw new Error('No user ID in token')
    }
  } catch (error) {
    console.error('Token decode error:', error)
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  // Get all notes for this user
  const { data, error } = await supabase
    .from('notesenctest')
    .select('id, ciphertext, salt, iv, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase select error:', error)
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Database error: ${error.message}` 
    })
  }

  return { notes: data || [] }
})
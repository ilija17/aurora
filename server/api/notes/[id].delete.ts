// server/api/notes/[id].delete.ts
import { defineEventHandler, getRouterParam, getCookie, createError } from 'h3'
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
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  const noteId = getRouterParam(event, 'id')
  if (!noteId) {
    throw createError({ statusCode: 400, statusMessage: 'Note ID required' })
  }

  // Delete note (only if it belongs to the current user)
  const { error } = await supabase
    .from('notes_enc')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId)

  if (error) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Failed to delete note' 
    })
  }

  return { success: true }
})
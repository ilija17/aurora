// server/api/diary-entry/[id].patch.ts
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
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

  const id = Number(getRouterParam(event, 'id'))
  
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  try {
    const body = await readBody(event)
    const { ciphertext, iv } = body

    if (!ciphertext || !iv) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Missing ciphertext or iv' 
      })
    }

    const { error } = await supabase
      .from('diary_entries')
      .update({
        data: ciphertext,
        iv: iv,
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own entries

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return { success: true, message: 'Updated successfully' }
  } catch (e: any) {
    if (e.statusCode) {
      throw e // Re-throw HTTP errors
    }
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Invalid request body' 
    })
  }
})
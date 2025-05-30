import { defineEventHandler, readBody, createError } from 'h3'
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

  const { ciphertext, iv } = await readBody(event) as {
    ciphertext: string
    iv:         string
  }

  if (!ciphertext || !iv) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing encrypted data: ciphertext and iv are required'
    })
  }

  const { data, error } = await 
  supabase.rpc('create_mood_entry', {
    p_user_id:    user.id,
    p_ciphertext: ciphertext,
    p_iv:         iv
  })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, id: data.id }
})

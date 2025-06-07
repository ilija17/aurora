import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const body = await readBody(event)
  const { ciphertext, salt, iv } = body

  if (!ciphertext || !salt || !iv) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing encrypted data: ciphertext, salt, and iv are required' 
    })
  }

  const { data, error } = await supabase
    .from('notes_enc')
    .insert({
      user_id: user.id,
      ciphertext: ciphertext,
      salt: salt,
      iv: iv
    })
    .select()
    .single()

  if (error) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Database error: ${error.message}` 
    })
  }

  return { success: true, id: data.id }
})
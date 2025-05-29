import { defineEventHandler, readBody, getCookie, createError } from 'h3'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

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
    if (!userId) {
      throw new Error('No user ID in token')
    }
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
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
    .from('notesenctest')
    .insert({
      user_id: userId,
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
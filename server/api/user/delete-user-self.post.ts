import { defineEventHandler, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const sessionUser = await serverSupabaseUser(event)
  const config = useRuntimeConfig()

  if (!sessionUser) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const userId = sessionUser.id

  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey,
  )

  // directly remove the user profile
  // DELETE FROM profiles WHERE id = '<userId>';
  const { error: deleteProfileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (deleteProfileError) {
    return {
      statusCode: 500,
      body: { error: 'Failed to delete profile' },
    }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { message: 'User deleted' }
})

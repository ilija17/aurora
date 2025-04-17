import { defineEventHandler, createError } from 'h3'
import { serverSupabaseUser }            from '#supabase/server'
import { createClient }                  from '@supabase/supabase-js'
import { useRuntimeConfig }              from '#imports'

export default defineEventHandler(async (event) => {
  // valid sesion
  const sessionUser = await serverSupabaseUser(event)
  if (!sessionUser) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const config        = useRuntimeConfig()
  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey
  )

  // only current user can delete itself
  const { error } = await supabaseAdmin.auth.admin.deleteUser(sessionUser.id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { message: 'User deleted' }
})

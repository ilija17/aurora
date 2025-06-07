import { defineEventHandler, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { getUserData } from '@/server/utils/getUserData'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const { userUuid } = event.context.params as { userUuid: string }

  // Allow users to fetch only their own data unless further role checks are added
  // (e.g. admin users accessing others' data)
  if (userUuid !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return getUserData(supabase, userUuid)
})

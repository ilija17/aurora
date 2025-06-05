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

  return getUserData(supabase, userUuid)
})

import { defineEventHandler, createError } from 'h3'
import { serverSupabaseUser }            from '#supabase/server'
import { createClient }                  from '@supabase/supabase-js'
import { useRuntimeConfig }              from '#imports'

export default defineEventHandler(async (event) => {
  // valid sesion
  const sessionUser = await serverSupabaseUser(event);
  const config      = useRuntimeConfig();
  if (!sessionUser) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
  }
  const userId = sessionUser.id
  
  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey
  )


  // 1. Get all mood entry IDs belonging to the user
  const { data: entries, error: entryError } = await supabaseAdmin
    .from('mood_entries')
    .select('id')
    .eq('user_id', userId)

  if (entryError) {
    return {
      statusCode: 500,
      body: { error: 'Error fetching user mood entries' },
    }
  }

  const moodEntryIds = entries?.map((entry) => entry.id) ?? []

  // 2. Delete from mood_entries_detailed_moods (join table)
  if (moodEntryIds.length > 0) {
    const { error: deleteJoinError } = await supabaseAdmin
      .from('mood_entries_detailed_moods')
      .delete()
      .in('mood_entry_id', moodEntryIds)

    if (deleteJoinError) {
      return {
        statusCode: 500,
        body: { error: 'Failed to delete from join table' },
      }
    }
  }

  // 3. Delete mood_entries
  const { error: deleteEntriesError } = await supabaseAdmin
    .from('mood_entries')
    .delete()
    .eq('user_id', userId)

  if (deleteEntriesError) {
    return {
      statusCode: 500,
      body: { error: 'Failed to delete mood entries' },
    }
  }

  // 4. Delete from profiles
  const { error: deleteProfileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId)

  // only current user can delete itself
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { message: 'User deleted' };
})

import { SupabaseClient } from '@supabase/supabase-js'

export async function getUserData(
  supabase: SupabaseClient,
  uuid: string
) {
  const { data, error } = await supabase.rpc('get_user_mood_entries', {
    _user_id: uuid
  })

  if (error) {
    throw new Error(`Supabase RPC error: ${error.message}`)
  }
  return data
}

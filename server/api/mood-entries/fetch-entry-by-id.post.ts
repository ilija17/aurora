import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);
  const config      = useRuntimeConfig();
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
  }
  const userId = user.id

  const body = await readBody<{ entry_id: number}>(event);

  const currentDate = new Date();
  const entry_id = body.entry_id;

  const { data, error } = await client
    .rpc('fetch_mood_entry_by_id', { entry_id: entry_id })

if (error) {
  throw createError({ statusCode: 500, statusMessage: 'Database query failed' })
}

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Database query failed' })
  }
  
  return { success: true, mood_entry: data };
});

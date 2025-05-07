import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);
  const config      = useRuntimeConfig();
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
  }
  const userId = user.id

  const body = await readBody<{ year: number}>(event);

  const currentDate = new Date();
  const year = body.year;
  if(year > currentDate.getFullYear()){
    throw createError({ statusCode: 400, statusMessage: 'Cannot fetch data past the current year' });
  }

  const fromDate = `${year}-01-01T00:00:00.000Z`;
  const toDate = `${year + 1}-01-01T00:00:00.000Z`;

  const { data, error } = await client
    .from('mood_entries')
    .select('entry_timestamp, general_mood, general_moods ( mood_name )')
    .eq('user_id', userId)
    .gte('entry_timestamp', fromDate)
    .lt('entry_timestamp', toDate);

  if (error) {
    console.error('Error fetching mood entries:', error);
    throw error;
  }

  console.log(data);
  return { success: true, mood_entries: data };
})

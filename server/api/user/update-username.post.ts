import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const usernamePattern = /^[A-Za-z0-9_-]{3,30}$/

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);
  

  if(!user){
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const body = await readBody<{ username: string }>(event);
  const username = body.username;

  if (!username || !usernamePattern.test(username)) {
    throw createError({
      statusCode:    400,
      statusMessage: 'Username must be 3–30 characters, letters, numbers, underscores or hyphens only.'
    })
  }

  const { data: existing, error: checkError } = await client
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .maybeSingle();

  if(checkError){
    throw createError({statusCode: 500, statusMessage: checkError.message })
  }

  if(existing){
    throw createError({ statusCode: 409, statusMessage: "Username already taken!" })
  }

  const { error: updateError } = await client
    .from('profiles')
    .update({ username: username })
    .eq('id', user.id);

  if(updateError){
    throw createError({ statusCode: 500, statusMessage: updateError.message });
  }

  return { success: true, message: 'Username updated' };
});
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }

  const body = await readBody<{ password: string, email: string }>(event);
  const password = body.password;
  const email = body.email;

  // Check if both email and password are provided
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required.'
    });
  }

  // Ensure the user has an email
  if (!user.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user email.'
    });
  }

  // Initialize Supabase client
  const {
    public: { supabaseUrl },
    supabaseServiceRoleKey 
  } = useRuntimeConfig();

  const supabase = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );

  // Re-authenticate user to ensure correct password
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password
  });

  if (reauthError) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Incorrect password.'
    });
  }

  // Update user email
  const { error: updateError } = await client.auth.updateUser({ email: email });

  if (updateError) {
    console.log(updateError.message, updateError.code);
    if(updateError.code == 'email_exists'){
      throw createError({
        statusCode: 409,
        statusMessage: 'An account has already been registered with this e-mail'
      });
    }else{
      throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update email.'
    });
    }
  }

  console.log("updated email to: ", email);
  return { success: true, message: 'Email updated' };
});

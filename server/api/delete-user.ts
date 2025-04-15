import { createClient } from '@supabase/supabase-js'
import { defineEventHandler, readBody } from 'h3'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userId = body.userId

  if (!userId) {
    return {
      status: 400,
      body: { error: 'User ID is required' },
    }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return {
      status: 500,
      body: { error: error.message },
    }
  }

  return {
    status: 200,
    body: { message: 'User deleted successfully' },
  }
})

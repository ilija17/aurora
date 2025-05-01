import {
  defineEventHandler,
  readBody,
  createError,
  setCookie
} from 'h3'
import { createClient } from '@supabase/supabase-js'

const usernamePattern = /^[A-Za-z0-9_-]{3,30}$/
const ACCESS_COOKIE   = 'sb-access-token'
const REFRESH_COOKIE  = 'sb-refresh-token'

export default defineEventHandler(async (event) => {
  const {
    public: { supabaseUrl },
    supabaseServiceRoleKey 
  } = useRuntimeConfig()

  const supabase = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        // without this its schrodinger's login, maybe it works, maybe not
        persistSession: false,
        autoRefreshToken: false
      }
    }
  )

  const { email, password, isLogin, username } = await readBody<{
    email: string
    password: string
    isLogin: boolean
    username?: string
  }>(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required.' })
  }

  if (!isLogin) {
    if (!username || !usernamePattern.test(username)) {
      throw createError({
        statusCode:    400,
        statusMessage: 'Username must be 3–30 characters, letters, numbers, underscores or hyphens only.'
      })
    }
    if (password.length < 6) {
      throw createError({ statusCode: 400, statusMessage: 'Password must be at least 6 characters.' })
    }
  }

  const { data, error } = isLogin
    ? await supabase.auth.signInWithPassword({ email, password })
    : await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      })

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  const session = data.session
  if (session) {
    setCookie(event, ACCESS_COOKIE, session.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: session.expires_in
    })

    setCookie(event, REFRESH_COOKIE, session.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 year, maybe
    })
  }

  return { user: data.user, session: data.session }
})

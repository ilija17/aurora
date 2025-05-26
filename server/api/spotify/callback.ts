import {
  defineEventHandler,
  getQuery,
  getCookie,
  setCookie,
  sendRedirect,
  createError
} from 'h3'
import { useRuntimeConfig } from '#imports'
import { encode as btoa } from 'base-64'

export default defineEventHandler(async event => {
  const {
    spotifyClientId,
    spotifyClientSecret,
    spotifyRedirectUri
  } = useRuntimeConfig()

  const { code, state } = getQuery(event)
  if (!code || !state) {
    throw createError({ statusCode: 400, statusMessage: 'Missing code or state' })
  }

  const storedState = getCookie(event, 'spotify_state')
  if (!storedState || storedState !== state) {
    throw createError({ statusCode: 400, statusMessage: 'state_mismatch' })
  }
  setCookie(event, 'spotify_state', '', { maxAge: 0 })

  const tokenRes: any = await $fetch(
    'https://accounts.spotify.com/api/token',
    {
      method:  'POST',
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        Authorization:   `Basic ${btoa(`${spotifyClientId}:${spotifyClientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type:   'authorization_code',
        code:         String(code),
        redirect_uri: spotifyRedirectUri
      }).toString()
    }
  ).catch(() => {
    throw createError({ statusCode: 502, statusMessage: 'Spotify token error' })
  })

  const { access_token, refresh_token, expires_in } = tokenRes
  const expiresAt = Date.now() + expires_in * 1000

  const baseOpts = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure:   process.env.NODE_ENV === 'production'
  }

  setCookie(event, 'spotify_access',  access_token, {
    ...baseOpts,
    maxAge: expires_in
  })
  setCookie(event, 'spotify_expires', String(expiresAt), {
    ...baseOpts,
    maxAge: expires_in
  })
  setCookie(event, 'spotify_refresh', refresh_token, baseOpts)

  sendRedirect(event, '/spotify')
})

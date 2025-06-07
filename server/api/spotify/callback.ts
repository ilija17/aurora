import { defineEventHandler, getQuery, createError, sendRedirect, setCookie } from 'h3'
import { useRuntimeConfig } from '#imports'
import { URLSearchParams } from 'url'

export default defineEventHandler(async (event) => {
  const { spotifyClientId, spotifyClientSecret, spotifyRedirectUri } = useRuntimeConfig()
  const { code, state } = getQuery(event)

  const storedState = event.node.req.headers.cookie
    ?.split('; ')
    .find(c => c.startsWith('spotify_state='))
    ?.split('=')[1]

  if (!state || state !== storedState) {
    throw createError({ statusCode: 400, statusMessage: 'state_mismatch' })
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: String(code),
    redirect_uri: spotifyRedirectUri,
  })
  const basic = Buffer
    .from(`${spotifyClientId}:${spotifyClientSecret}`)
    .toString('base64')

  const tokenRes: any = await $fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  const secure = process.env.NODE_ENV === 'production'
  setCookie(event, 'spotify_access_token', tokenRes.access_token, {
    httpOnly: true,
    maxAge: tokenRes.expires_in,
    sameSite: 'lax',
    secure,
    path: '/api/spotify'
  })
  setCookie(event, 'spotify_refresh_token', tokenRes.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/api/spotify'
  })

  sendRedirect(event, '/spotify')
})
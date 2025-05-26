import { defineEventHandler, getQuery, createError, sendRedirect, setCookie, getCookie } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const spotifyClientId = config.public.spotifyClientId
  const spotifyClientSecret = config.spotifyClientSecret
  const spotifyRedirectUri = config.spotifyRedirectUri

  const { code, state, error } = getQuery(event)

  if (error) {
    return sendRedirect(event, '/?error=spotify_access_denied', 302);
  }

  const storedState = getCookie(event, 'spotify_auth_state')

  if (!state || state !== storedState) {
    setCookie(event, 'spotify_auth_state', '', { maxAge: -1, path: '/' });
    throw createError({ statusCode: 400, statusMessage: 'State mismatch. Please try authenticating again.' })
  }

  setCookie(event, 'spotify_auth_state', '', { maxAge: -1, path: '/' });

  const bodyParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code: String(code),
    redirect_uri: spotifyRedirectUri,
  })

  const basicAuth = Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString('base64')

  try {
    const tokenResponse: any = await $fetch('[https://accounts.spotify.com/api/token](https://accounts.spotify.com/api/token)', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    })

    setCookie(event, 'spotify_access_token', tokenResponse.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenResponse.expires_in,
      path: '/',
    })

    if (tokenResponse.refresh_token) {
      setCookie(event, 'spotify_refresh_token', tokenResponse.refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })
    }

    return sendRedirect(event, '/spotify/dashboard', 302)

  } catch (fetchError: any) {
    throw createError({
      statusCode: fetchError.response?.status || 500,
      statusMessage: 'Failed to obtain Spotify token.',
      data: fetchError.data
    })
  }
})
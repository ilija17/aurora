import { defineEventHandler, createError, getCookie, setCookie } from 'h3'
import { useRuntimeConfig } from '#imports'
import { URLSearchParams } from 'url'

export default defineEventHandler(async (event) => {
  const { spotifyClientId, spotifyClientSecret } = useRuntimeConfig()
  const refreshToken = getCookie(event, 'spotify_refresh_token')
  if (!refreshToken) {
    throw createError({ statusCode: 401, statusMessage: 'No refresh token' })
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
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

  setCookie(event, 'spotify_access_token', tokenRes.access_token, {
    httpOnly: true,
    maxAge: tokenRes.expires_in,
  })

  return { access_token: tokenRes.access_token, expires_in: tokenRes.expires_in }
})
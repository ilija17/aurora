import { defineEventHandler, setCookie, sendRedirect } from 'h3'
import { useRuntimeConfig } from '#imports'
import { randomBytes } from 'crypto'

export default defineEventHandler(event => {
  const config = useRuntimeConfig(event)
  const spotifyClientId = config.public.spotifyClientId
  const spotifyRedirectUri = config.spotifyRedirectUri

  const state = randomBytes(16).toString('hex')

  setCookie(event, 'spotify_auth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: spotifyClientId,
    scope: [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-library-read'
    ].join(' '),
    redirect_uri: spotifyRedirectUri,
    state: state
  })

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${params.toString()}`

  return sendRedirect(event, spotifyAuthUrl)
})
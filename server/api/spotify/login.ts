import { defineEventHandler, sendRedirect, setCookie } from 'h3'
import { useRuntimeConfig } from '#imports'
import { randomBytes } from 'crypto'

export default defineEventHandler((event) => {
  const { spotifyClientId, spotifyRedirectUri } = useRuntimeConfig()
  const state = randomBytes(16).toString('hex')
  const secure =
    event.node.req.headers['x-forwarded-proto'] === 'https' ||
    Boolean((event.node.req.socket as any)?.encrypted)
  setCookie(event, 'spotify_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/api/spotify'
  })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: spotifyClientId,
    scope: 'user-read-private user-read-email user-top-read user-library-read',
    redirect_uri: spotifyRedirectUri,
    state,
  })

  sendRedirect(event, `https://accounts.spotify.com/authorize?${params.toString()}`)
})
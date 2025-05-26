import { defineEventHandler, setCookie, sendRedirect } from 'h3'
import { useRuntimeConfig } from '#imports'
import { randomBytes } from 'crypto'

export default defineEventHandler(event => {
  const { spotifyClientId, spotifyRedirectUri } = useRuntimeConfig()

  const state = randomBytes(16).toString('hex')
  setCookie(event, 'spotify_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production'
  })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     spotifyClientId,
    scope:         [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-library-read'
    ].join(' '),
    redirect_uri:  spotifyRedirectUri,
    state
  })

  sendRedirect(
    event,
    `https://accounts.spotify.com/authorize?${params.toString()}`
  )
})

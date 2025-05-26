import type { H3Event } from 'h3'
import { getCookie } from 'h3'

export function hasValidSpotifyToken (event: H3Event): boolean {
  const access  = getCookie(event, 'spotify_access')
  const expires = Number(getCookie(event, 'spotify_expires') || 0)
  return Boolean(access && Date.now() < expires)
}

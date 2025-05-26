import { getCookie } from 'h3'
import type { H3Event } from 'h3'

export function hasValidSpotifyToken (event: H3Event): boolean {
  const token   = getCookie(event, 'spotify_access')
  const expires = Number(getCookie(event, 'spotify_expires') || 0)
  return Boolean(token && Date.now() < expires)
}

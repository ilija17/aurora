import { getCookie } from 'h3'
import type { H3Event } from 'h3'

export function hasValidSpotifyToken (event: H3Event) {
  const token = getCookie(event, 'spotify_access_token')
  return Boolean(token)
}
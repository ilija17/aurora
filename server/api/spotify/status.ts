import { defineEventHandler } from 'h3'
import { hasValidSpotifyToken } from '~/server/utils/spotify'

export default defineEventHandler((event) => {
  const valid = hasValidSpotifyToken(event)
  return { valid }
})

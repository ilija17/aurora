import { defineEventHandler, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, 'spotify_access_token')
  
  if (!accessToken) {
    return { authenticated: false }
  }

  try {
    await $fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    return { authenticated: true }
  } catch (error) {
    try {
      await $fetch('/api/spotify/refresh')
      return { authenticated: true }
    } catch (refreshError) {
      return { authenticated: false }
    }
  }
})
import { defineEventHandler, createError, getQuery, getCookie, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const { query } = getQuery(event) as { query?: string }
  if (!query) {
    throw createError({ statusCode: 400, statusMessage: 'Missing `query` parameter' })
  }

  let token = getCookie(event, 'spotify_access_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const fetchSearch = () =>
    $fetch('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q: query,
        type: 'track',
        limit: '10'
      }
    })

  try {
    const { tracks }: any = await fetchSearch()
    return tracks.items
  } catch (err: any) {
    if (err._data?.error?.status === 401) {
      const { access_token: newToken, expires_in }: any = await $fetch('/api/spotify/refresh')
      token = newToken
      setCookie(event, 'spotify_access_token', newToken, {
        httpOnly: true,
        maxAge: expires_in
      })
      const { tracks: retryTracks }: any = await fetchSearch()
      return retryTracks.items
    }
    throw err
  }
})

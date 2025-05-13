import { defineEventHandler, createError, getCookie, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  let token = getCookie(event, 'spotify_access_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const { timeframe } = event.context.params as {
    timeframe: string
  }
  const fetchTop = () =>
    $fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeframe}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: '10' }
    })

  try {
    const { items }: any = await fetchTop()
    return items
  } catch (err: any) {
    if (err._data?.error?.status === 401) {
      const { access_token: newToken, expires_in }: any = await $fetch('/api/spotify/refresh')
      token = newToken
      setCookie(event, 'spotify_access_token', newToken, {
        httpOnly: true,
        maxAge: expires_in
      })
      const { items: retryItems }: any = await fetchTop()
      return retryItems
    }
    throw err
  }
})

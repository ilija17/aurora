import { useFetch } from '#app'

export function useSpotifySession () {
  const { data, pending, refresh, error } = useFetch('/api/spotify/status', {
    lazy:   true,
    server: false
  })

  const isLoggedIn = computed(() => data.value?.valid === true)

  return { isLoggedIn, pending, refresh, error }
}

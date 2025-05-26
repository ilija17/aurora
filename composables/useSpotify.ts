export const useSpotify = () => {
  const { data: authData } = useFetch('/api/spotify/check-auth')
  
  const isAuthenticated = computed(() => authData.value?.authenticated === true)
  
  return { isAuthenticated }
}
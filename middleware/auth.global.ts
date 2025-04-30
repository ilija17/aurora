export default defineNuxtRouteMiddleware((to, _from) => {
  const user = useSupabaseUser()

  const isPublic = to.meta.requiresAuth === false
  if (!isPublic && !user.value) {
    return navigateTo('/login')
  }
})

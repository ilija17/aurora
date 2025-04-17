export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth && !user.value) {
    return navigateTo('/login')
  }
})

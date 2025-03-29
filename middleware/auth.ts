import { publicRoutes } from '~/utils/publicRoutes'

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  const isPublic = publicRoutes.some(path => to.path.startsWith(path))

  if (!user.value && !isPublic) {
    console.log('[auth middleware] Redirecting to /login')
    return navigateTo('/login')
  }
})

export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser()
    console.log('[auth middleware] to.path:', to.path)
    console.log('[auth middleware] user:', user.value)
  
    const publicPages = ['/login', '/forgot-password', '/reset-password']
  
    if (!user.value && !publicPages.includes(to.path)) {
      console.log('[auth middleware] Redirecting to /login')
      return navigateTo('/login')
    }
  })
  
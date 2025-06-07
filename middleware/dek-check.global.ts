export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return;

  if (to.meta.requiresAuth === false) return;

  if (to.path === '/unlock' || to.path === '/spotify' || to.path === '/reset-password') return;

  const { dek, kek } = useDek();
  if (!dek.value || !kek.value) {
    return navigateTo({ path: '/unlock', query: { redirect: to.fullPath } });
  }
});

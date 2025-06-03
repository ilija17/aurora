<template>
  <header class="header">
    <div class="header-inner">
      <NuxtLink to="/" class="site-title">Aurora</NuxtLink>
      <ThemeSwitcher />
    </div>

    <nav class="nav" aria-label="Main menu">
      <NuxtLink to="/" class="btn" active-class="btn--active" exact-active-class="btn--active">Home</NuxtLink>
      <NuxtLink
        to="/spotify"
        class="btn"
      active-class="btn--active"
      exact-active-class="btn--active"
    >
      Spotify Brainrot
    </NuxtLink>

    <NuxtLink
      to="/welcome"
      class="btn"
      active-class="btn--active"
      exact-active-class="btn--active"
    >
      Mood Input
    </NuxtLink>

    <NuxtLink
      to="/settings"
      class="btn"
      active-class="btn--active"
      exact-active-class="btn--active"
    >
      Settings
    </NuxtLink>

    <NuxtLink
      to="/mood-calendar-test"
      class="btn"
      active-class="btn--active"
      exact-active-class="btn--active"
    >
      Mood calendar
    </NuxtLink>

    <NuxtLink
      to="/llm"
      class="btn"
      active-class="btn--active"
      exact-active-class="btn--active"
    >
      Pseudo-psychiatrist
    </NuxtLink>

    <NuxtLink
      to="/secrets"
      class="btn"
      active-class="btn--active"
      exact-active-class="btn--active"
    >
      Encrypted notes
    </NuxtLink>
    <NuxtLink
      v-if="user"
      to="/logoutpage"
      class="btn"
      active-class="btn--active"
      exact-active-class="btn--active"
    >
      Logout
    </NuxtLink>
    <NuxtLink
      v-else
      to="/login"
      class="btn"
      active-class="btn--active"
      exact-active-class="btn--active"
    >
      Login
    </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
</script>

<style scoped>
.header {
  background: linear-gradient(90deg, var(--primary), var(--accent));
  padding: 1rem 0.5rem;
}
.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.site-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--fg);
  text-decoration: none;
}
</style>



<!-- Updated header with layout wrapper -->
<template>
  <header class="app-header">
    <div class="container flex items-center justify-between gap-4 py-3">
      <NuxtLink to="/" class="logo">Aurora</NuxtLink>
      <div class="flex items-center gap-4">
        <ThemeSwitcher />

        <nav class="nav flex gap-3" aria-label="Main menu">
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
        </nav>
      </div>
    </div>
  </header>
</template>

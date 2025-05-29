<!-- ovo je takav brainrot al uglavom router skuži na kojoj se stranici i stavi ovaj drugi css -->
<template>
  <ThemeSwitcher/>
  
  <nav class="nav" aria-label="Main menu">    
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
</template>

<!-- ovo je takav brainrot al uglavom router skuži na kojoj se stranici i stavi ovaj drugi css -->
<template>
  
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
      to="/calendar"
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
      to="/diary"
      class="btn"
      active-class="btn--active"
      exact-active-class="btn--active"
    >
      Encrypted diary
    </NuxtLink>

    <NuxtLink
      to="/unlock"
      class="btn"
      active-class="btn--active"
      exact-active-class="btn--active"
    >
      Unlock keys
    </NuxtLink>
  </nav>
</template>

<template>
  <div class="layout">
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
    <ThreeBodyAnimation
      v-if="decrypting"
      class="fixed inset-0 z-50 pointer-events-none opacity-80"
    />
  </div>
</template>

<script setup lang="ts">
import ThreeBodyAnimation from '~/components/ThreeBodyAnimation.vue'
import { decrypting } from '~/composables/useCryptoAnimation'
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>

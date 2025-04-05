<template>
  <ClientOnly>
    <div>
      <h1>Color mode: {{ colorMode.value }}</h1>

      <select v-model="colorMode.preference">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="sepia">Sepia</option>
      </select>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
</script>

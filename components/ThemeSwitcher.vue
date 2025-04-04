<template>
  <ClientOnly>
    <div>
      <h2>Color mode: {{ colorMode.value }}</h2>

      <select v-model="colorMode.preference" @change="onChange">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="sepia">Sepia</option>
      </select>
    </div>
  </ClientOnly>
</template>

<script setup>
const colorMode = useColorMode()
</script>

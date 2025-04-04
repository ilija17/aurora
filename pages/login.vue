<template>
  <div>
    <h1>Color mode: {{ colorMode.value }}</h1>

    <select v-model="colorMode.preference" @change="onChange">
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="sepia">Sepia</option>
    </select>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
console.log('colorMode setup:', colorMode)


function onChange(e: Event) {
  const selected = (e.target as HTMLSelectElement).value
  console.log('Color mode changed:', selected)
}
</script>

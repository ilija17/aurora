<template>
  <div style="padding: 100px" class="grid place-items-center">
    <div class="grid place-items-center gap-24 p-24">
      <HelloUser/>
      <MoodSelector v-model="mood" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  const mood = ref('')

  definePageMeta({
    requiresAuth: true
  })
</script>

<style>

</style>
<template>
  <div v-if="user" class="grid place-items-center">
    <p class="text-4xl font-extrabold text-gray-900 dark:text-white">
      Welcome,<br />
      {{ username || user.email }} 😀
    </p>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user     = useSupabaseUser()

const { data: profile } = await useAsyncData('profile', async () => {
  if (!user.value) return null
  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.value.id)
    .single()
  return data
})

const username = computed(() => profile.value?.username || '')
</script>

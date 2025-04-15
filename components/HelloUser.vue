<template>
  <div>
    <div v-if="user" class="grid place-items-center">
      <p class="text-4xl font-extrabold text-gray-900 dark:text-white">Welcome,<br> {{ username || user.email }} 😀</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
const loading = ref(true)
const username = ref('')
const supabase = useSupabaseClient()
const user = useSupabaseUser()

watchEffect(async () => {
  if (user.value) {
    loading.value = true

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.value.id)
      .single()

    if (data?.username) {
      username.value = data.username
    }

    loading.value = false
  }
})
</script>

<style>

</style>
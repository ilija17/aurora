<template>
  <div>
    <div v-if="user">
      <h2>Welcome, {{ username || user.email }}</h2>
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
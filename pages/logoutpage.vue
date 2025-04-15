<template>
  <div v-if="user">
    <HelloUser />
    <button @click="deleteUser">Delete</button>
    <button @click="logout">Logout</button>
  </div>

  <div v-else>
    <p>Redirecting to login...</p>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

watch(user, () => {
  if (!user.value) {
    navigateTo('/login')
  }
}, { immediate: true })

const logout = async () => {
  await supabase.auth.signOut()
}

const deleteUser = async () => {
  const { error } = await $fetch('/api/delete-user', {
    method: 'POST',
    body: {
      userId: user.value.id,
    },
  })

  if(!error){
    logout()
  }
}

</script>

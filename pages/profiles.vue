<script setup lang="ts">
definePageMeta({
  requiresAuth: false
})

const email    = ref('')
const password = ref('')
const username = ref('')

const sb      = useSupabaseClient()
const { dek, unlock } = useDek()

async function signUp () {
  await sb.auth.signUp({
    email: email.value,
    password: password.value,
    options: { data: { username: username.value } }
  })
  alert('Confirm the email then log in')
}

async function logIn () {
  await sb.auth.signInWithPassword({ email: email.value, password: password.value })
  await unlock(password.value)
  alert('DEK unlocked in RAM: ' + Boolean(dek.value))
}
</script>

<template>
  <div class="space-y-2">
    <input v-model="email"    placeholder="email">
    <input v-model="password" placeholder="password" type="password">
    <input v-model="username" placeholder="username (sign-up only)">
    <button @click="signUp">sign-up</button>
    <button @click="logIn">log-in & unlock</button>
  </div>
</template>

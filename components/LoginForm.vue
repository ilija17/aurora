<!-- components/LoginForm.vue -->
<template>
  <form @submit.prevent="onSubmit" class="space-y-6 max-w-md mx-auto p-6 bg-white rounded shadow">
    <FormInput
      id="email"
      label="Email"
      type="email"
      placeholder="you@example.com"
      v-model="email"
      helper="We'll never share your email."
    />

    <FormInput
      id="password"
      label="Password"
      type="password"
      placeholder="••••••••"
      v-model="password"
    />

    <button
      type="submit"
      class="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Log in
    </button>
  </form>
</template>

<script setup>
const email = ref('')
const password = ref('')

const onSubmit = () => {
  console.log('Logging in with', email.value, password.value)
  // You could also validate, call Supabase, etc.
}
</script>

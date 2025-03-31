<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const isLogin = ref(true)
const errorMsg = ref('')
const form = ref({
  email: '',
  password: ''
})

const handleAuth = async () => {
  const { email, password } = form.value

  if (!email || !password) {
    errorMsg.value = 'Please enter both email and password'
    return
  }

  errorMsg.value = ''

  const { error } = isLogin.value
    ? await supabase.auth.signInWithPassword({ email, password })
    : await supabase.auth.signUp({ email, password })

  if (error) {
    errorMsg.value = error.message
  } else {
    navigateTo('/logoutpage')
  }
}

watch(user, () => {
  if (user.value) navigateTo('/logoutpage')
}, { immediate: true })

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
}

const goToResetPage = () => {
  navigateTo('/forgot-password')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow space-y-6">
      <h2 class="text-2xl font-semibold text-center text-gray-800">
        {{ isLogin ? 'Login' : 'Register' }}
      </h2>

      <UForm :state="form" @submit="handleAuth" class="space-y-5">
        <UInput
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          required
        />
        <UInput
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="••••••••"
          required
        />

        <UButton type="submit" class="w-full justify-center">
          {{ isLogin ? 'Login' : 'Register' }}
        </UButton>

        <p v-if="errorMsg" class="text-red-500 text-sm text-center">
          {{ errorMsg }}
        </p>

        <p class="text-sm text-center">
          <a href="#" @click.prevent="toggleMode" class="text-blue-600 hover:underline">
            {{ isLogin ? "Don't have an account? Register" : "Already have an account? Login" }}
          </a>
        </p>

        <p class="text-sm text-center">
          <a href="#" @click.prevent="goToResetPage" class="text-blue-600 hover:underline">
            Forgot password?
          </a>
        </p>
      </UForm>
    </div>
  </div>
</template>

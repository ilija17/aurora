<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-md space-y-6">
      <h2 class="text-2xl font-semibold text-center text-gray-800">
        {{ isLogin ? 'Login' : 'Register' }}
      </h2>

      <div class="space-y-4">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="handleAuth"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          {{ isLogin ? 'Login' : 'Register' }}
        </button>

        <p v-if="errorMsg" class="text-red-500 text-sm text-center">{{ errorMsg }}</p>

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
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const isLogin = ref(true)

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
}

const handleAuth = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = 'Please enter both email and password'
    return
  }

  errorMsg.value = ''

  try {
    let result
    if (isLogin.value) {
      result = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
    } else {
      result = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
    }

    if (result.error) {
      errorMsg.value = result.error.message
    } else {
      navigateTo('/logoutpage')
    }
  } catch (err) {
    errorMsg.value = 'Unexpected error occurred'
  }
}

const user = useSupabaseUser()
watch(user, () => {
  if (user.value) {
    navigateTo('/logoutpage')
  }
}, { immediate: true })

const goToResetPage = () => {
  console.log('[login.vue] Forgot password clicked')
  navigateTo('/forgot-password')
}


</script>

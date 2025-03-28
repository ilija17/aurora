<template>
  <div>
    <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>

    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />

    <button @click="handleAuth">
      {{ isLogin ? 'Login' : 'Register' }}
    </button>

    <p v-if="errorMsg" style="color: red;">{{ errorMsg }}</p>

    <p>
      <a href="#" @click.prevent="toggleMode">
        {{ isLogin ? "Don't have an account? Register" : "Already have an account? Login" }}
      </a>
    </p>
    <p>
      <a href="#" @click.prevent="goToResetPage">Forgot password?</a>
    </p>

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
      navigateTo('/logoutpage') // ✅ Redirect after login/register
    }
  } catch (err) {
    errorMsg.value = 'Unexpected error occurred'
  }
}

// Optional: redirect to /logoutpage if user is already logged in
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

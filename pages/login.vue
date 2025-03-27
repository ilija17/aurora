<!-- pages/auth.vue -->
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
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const isLogin = ref(true)

const toggleMode = () => {
  console.log('[toggleMode] Switching mode. Current isLogin:', isLogin.value)
  isLogin.value = !isLogin.value
  errorMsg.value = ''
}

const handleAuth = async () => {
  console.log('[handleAuth] Button clicked')
  console.log('[handleAuth] Email:', email.value)
  console.log('[handleAuth] Password:', password.value)
  console.log('[handleAuth] Mode:', isLogin.value ? 'Login' : 'Register')

  if (!email.value || !password.value) {
    errorMsg.value = 'Please enter both email and password'
    console.warn('[handleAuth] Missing fields')
    return
  }

  errorMsg.value = ''

  let result

  try {
    if (isLogin.value) {
      console.log('[handleAuth] Attempting login...')
      result = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
    } else {
      console.log('[handleAuth] Attempting registration...')
      result = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
    }

    console.log('[handleAuth] Supabase response:', result)

    if (result.error) {
      console.error('[handleAuth] Error from Supabase:', result.error)
      errorMsg.value = result.error.message
    } else {
      console.log('[handleAuth] Success! Redirecting...')
      await navigateTo('/')
    }

  } catch (err) {
    console.error('[handleAuth] Exception caught:', err)
    errorMsg.value = 'Unexpected error occurred'
  }
}
</script>

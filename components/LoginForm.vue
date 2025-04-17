<template>
  <div>
    <div class="grid place-items-center h-screen">
      <div>
        <h2 class="grid place-items-center">
          {{ isLogin ? 'Login' : 'Register' }}
        </h2>

        <div>
          <form @submit.prevent="handleAuth" class="space-y-4">

            <FormInput
              v-if="!isLogin"
              id="username"
              label="Username"
              type="text"
              v-model="username"
              placeholder="Your name or nickname"
            />

            <FormInput
              id="email"
              label="Email"
              type="email"
              v-model="email"
              placeholder="name@example.com"
            />

            <FormInput
              id="password"
              label="Password"
              type="password"
              v-model="password"
              placeholder="••••••••"
            />

            <div v-if="!isLogin" class="text-sm">
              <p>Strength: {{ strengthText }}</p>
              <p v-if="strengthFeedback" class="mt-1">{{ strengthFeedback }}</p>
            </div>

            <!-- Disabled for weak password -->
            <button
              type="submit"
              :disabled="!email || !password || (!isLogin && passwordScore < 3)"
              class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {{ isLogin ? 'Login' : 'Register' }}
            </button>
          </form>

          <p v-if="errorMsg" class="mt-2 text-red-600">{{ errorMsg }}</p>

          <p class="mt-4">
            <a href="#" @click.prevent="toggleMode" class="text-blue-500 hover:underline">
              {{ isLogin ? "Don't have an account? Register" : "Already have an account? Login" }}
            </a>
          </p>

          <p class="mt-2">
            <a href="#" @click.prevent="goToResetPage" class="text-blue-500 hover:underline">
              Forgot password?
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import zxcvbn from 'zxcvbn'

// regex za username
const usernamePattern = /^[A-Za-z0-9_-]{3,30}$/
const usernameError   = ref('')

const supabase = useSupabaseClient()
const username = ref('')
const email    = ref('')
const password = ref('')
const errorMsg = ref('')
const isLogin  = ref(true)

// Password strength metrics
const passwordScore    = ref(0)
const strengthText     = ref('')
const strengthFeedback = ref('')

watch(password, (pw) => {
  const { score, feedback } = zxcvbn(pw)
  passwordScore.value = score
  strengthText.value = ['Very weak','Weak','Fair','Good','Strong'][score]
  strengthFeedback.value = feedback.warning || feedback.suggestions.join(' ')
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
}

const handleAuth = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = 'Please enter both email and password'
    return
  }

  // Prevent registration if password too weak
  if (!isLogin.value && passwordScore.value < 3) {
    errorMsg.value = 'Please choose a stronger password.'
    return
  }

  if (!usernamePattern.test(username.value)) {
    usernameError.value =
      'Username must be 3–30 characters, letters, numbers, underscores or hyphens only.'
    return
  }
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
        options: { data: { username: username.value } },
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
  navigateTo('/forgot-password')
}
</script>

<style scoped>
</style>

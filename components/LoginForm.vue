<template>
  <div>
    <div class="grid place-items-center h-screen">
      <div>
        <h2 class="grid place-items-center">
          {{ isLogin ? 'Login' : 'Register' }}
        </h2>

        <form @submit.prevent="handleAuth" class="space-y-4">
          <!-- Username only for registration -->
          <div v-if="!isLogin">
            <FormInput
              id="username"
              label="Username"
              type="text"
              v-model="username"
              placeholder="Your name or nickname"
            />
            <p v-if="usernameError" class="text-red-600 text-sm mt-1">
              {{ usernameError }}
            </p>
          </div>

          <!-- Email -->
          <FormInput
            id="email"
            label="Email"
            type="email"
            v-model="email"
            placeholder="name@example.com"
          />

          <!-- Password -->
          <FormInput
            id="password"
            label="Password"
            type="password"
            v-model="password"
            placeholder="••••••••"
          />

          <!-- Password strength feedback -->
          <div v-if="!isLogin" class="text-sm">
            <p>Strength: {{ strengthText }}</p>
            <p v-if="strengthFeedback" class="mt-1">{{ strengthFeedback }}</p>
          </div>

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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabaseClient } from '#imports'
import { usePasswordStrength } from '~/composables/usePasswordStrength'
import { useUsernameValidator } from '~/composables/useUsernameValidator'
import { useDek } from '~/composables/useDek'
import { useDekRepair } from '~/composables/useDekRepair' //čisti brainrot

const router       = useRouter()
const supabase  = useSupabaseClient()
const isLogin     = ref(true)
const email       = ref('')
const password    = ref('')
const username    = ref('')
const errorMsg    = ref('')

const { score: passwordScore, text: strengthText, feedback: strengthFeedback }
  = usePasswordStrength(password)

const { error: usernameError, validate: validateUsername, sanitized: sanitizeUsername }
  = useUsernameValidator(username)

function toggleMode() {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
}

function goToResetPage() {
  router.push('/forgot-password')
}

async function handleAuth () {
  errorMsg.value = ''
  
  try {
    const { session } = await $fetch('/api/auth', {
      method: 'POST',
      body: {
        email:    email.value,
        password: password.value,
        isLogin:  isLogin.value,
        ...(isLogin.value ? {} : { username: sanitizeUsername() })
      }
    })

    if (session) {
      await supabase.auth.setSession({
        access_token:  session.access_token,
        refresh_token: session.refresh_token
      })
    }

    const { repairIfMissing } = useDekRepair()
    await repairIfMissing(password.value)

    const { unlock } = useDek()
    const { fetchContextData } = usePublicContextData()
    try {
      //ovo bi trebalo kao raditi
      await unlock(password.value)
      //spremi sve moods i contexts u composable
      await fetchContextData()
    } finally {
      // password napusti ram nakon toga jer nije potrebna
      password.value = ''
    }

    if(isLogin.value) {
      await router.push('/welcome')
    } else if(!isLogin.value) {
      await router.push('/check-email')
    } else {
      await router.push('/')
    }

  } catch (err: any) {
    errorMsg.value = err.message || 'Unexpected error'
  }
}
</script>

<style scoped>
</style>

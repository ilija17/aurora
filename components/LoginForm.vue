<!-- components/LoginForm.vue -->
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
            
            <button type="submit">
              {{ isLogin ? 'Login' : 'Register' }}
            </button>
          </form>


          <p v-if="errorMsg">{{ errorMsg }}</p>

          <p>
            <a href="#" @click.prevent="toggleMode">
              {{ isLogin ? "Don't have an account? Register" : "Already have an account? Login" }}
            </a>
          </p>

          <p>
            <a href="#" @click.prevent="goToResetPage">
              Forgot password?
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

  <script setup lang="ts">
  const supabase = useSupabaseClient()
  const username = ref('')
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

          options: {
            data: {
              username: username.value,
            },
          },
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
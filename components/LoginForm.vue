<template>
  <div class="grid place-items-center h-screen">
    <div>
      <h2 class="grid place-items-center">
        {{ isLogin ? 'Login' : 'Register' }}
      </h2>

      <form @submit.prevent="handleAuth" class="space-y-4">
        <!-- Username (registration only) -->
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

        <!-- Password strength feedback (registration only) -->
        <div v-if="!isLogin" class="text-sm">
          <p>Strength: {{ strengthText }}</p>
          <p v-if="strengthFeedback" class="mt-1">{{ strengthFeedback }}</p>
        </div>

        <button
          type="submit"
          :disabled="submitting || !email || !password || (!isLogin && passwordScore < 3)"
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSupabaseClient } from '#imports';

import { usePasswordStrength }   from '~/composables/usePasswordStrength';
import { useUsernameValidator }  from '~/composables/useUsernameValidator';
import { useDek }                from '~/composables/useDek';
import { useDekRepair }          from '~/composables/useDekRepair';
import { usePublicContextData }  from '~/composables/usePublicContextData';

import { saveSalt, clearSalt }   from '~/utils/cryptoHelpers';

const router     = useRouter();
const supabase   = useSupabaseClient();

const isLogin    = ref(true);
const email      = ref('');
const password   = ref('');
const username   = ref('');
const errorMsg   = ref('');
const submitting = ref(false);

const { score: passwordScore, text: strengthText, feedback: strengthFeedback } =
  usePasswordStrength(password);

const { error: usernameError, sanitized: sanitizeUsername } =
  useUsernameValidator(username);

const { unlock, storeKek, clearSession } = useDek();

function toggleMode() {
  isLogin.value = !isLogin.value;
  errorMsg.value = '';
}

function goToResetPage() {
  router.push('/forgot-password');
}

async function handleAuth() {
  errorMsg.value = '';
  submitting.value = true;

  // TODO: Refactor password handling logic

  const userPassword = password.value;
  try {
    const { session, salt, wrappedDek } = await $fetch('/api/auth', {
      method: 'POST',
      body: {
        email: email.value,
        password: userPassword,
        isLogin: isLogin.value,
        ...(isLogin.value ? {} : { username: sanitizeUsername() }),
      },
    });
    
    console.log('[AUTH] Server returned', { 
      salt, 
      wrappedDek: wrappedDek?.slice(0,16)+'…' 
    });

    if (session) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    }

    await unlock(userPassword);

    const { repairIfMissing } = useDekRepair();
    await repairIfMissing(userPassword, salt, wrappedDek);
    // Cache KEK for the session
    if (salt) {
      await storeKek(userPassword, salt);
      await saveSalt(salt);
      console.log('[CACHE] KEK cached for session');
    } else {
      console.warn('[AUTH] No salt returned from server');
    }

    const { fetchContextData } = usePublicContextData();
    await fetchContextData();

    if (isLogin.value) {
      await router.push('/welcome');
    } else {
      await router.push('/check-email');
    }

  } catch (err: any) {
    errorMsg.value = err.message ?? 'Unexpected error';
  } finally {
    password.value = '';
    submitting.value = false;
  }
}
</script>

<style scoped>
</style>

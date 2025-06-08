<template>
  <section class="min-h-screen flex items-center justify-center px-4 fade-in">
    <div class="max-w-md w-full space-y-6 bg-[var(--secondary)] p-6 sm:p-8 rounded-3xl shadow-2xl">
      <h2 class="text-2xl font-bold text-center">
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

        <!-- Confirm Password (registration only) -->
        <FormInput
          v-if="!isLogin"
          id="confirm-password"
          label="Confirm Password"
          type="password"
          v-model="confirmPassword"
          placeholder="••••••••"
        />
        <p
          v-if="!isLogin && confirmPassword && confirmPassword !== password"
          class="text-red-600 text-sm mt-1"
        >
          Passwords do not match
        </p>

        <!-- Password strength feedback (registration only) -->
        <div v-if="!isLogin" class="text-sm">
          <p>Strength: {{ strengthText }}</p>
          <p v-if="strengthFeedback" class="mt-1">{{ strengthFeedback }}</p>
        </div>

        <button
          type="submit"
          :disabled="
            submitting ||
            !email ||
            !password ||
            (!isLogin && (passwordScore < 3 || confirmPassword !== password))
          "
          class="btn w-full disabled:opacity-50"
        >
          {{ isLogin ? 'Login' : 'Register' }}
        </button>
      </form>

      <p v-if="errorMsg" class="mt-2 text-red-600">{{ errorMsg }}</p>

      <p class="mt-4 text-center">
        <a href="#" @click.prevent="toggleMode" class="text-blue-500 hover:underline">
          {{ isLogin ? "Don't have an account? Register" : "Already have an account? Login" }}
        </a>
      </p>

      <p class="mt-2 text-center">
        <a href="#" @click.prevent="goToResetPage" class="text-blue-500 hover:underline">
          Forgot password?
        </a>
      </p>
    </div>
  </section>
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
import { extractErrorMessage }   from '~/utils/errorHelpers';

const router     = useRouter();
const supabase   = useSupabaseClient();

const isLogin    = ref(true);
const email      = ref('');
const password   = ref('');
const confirmPassword = ref('');
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
  confirmPassword.value = '';
}

function goToResetPage() {
  router.push('/forgot-password');
}

async function handleAuth() {
  errorMsg.value = '';
  submitting.value = true;

  if (!isLogin.value && confirmPassword.value !== password.value) {
    errorMsg.value = 'Passwords do not match';
    submitting.value = false;
    return;
  }

  //ovo je doslovni brainrot al budemo kasnije popravili
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

    if (session) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      await unlock(userPassword);

      const { repairIfMissing } = useDekRepair();
      await repairIfMissing(userPassword, salt, wrappedDek);

      // spremi KEK NAVODNO, kek nestane brže nego Amelia Earhart
      if (salt) {
        await storeKek(userPassword, salt);
        await saveSalt(salt);
      } else {
      }
    } else {
    }

    const { fetchContextData } = usePublicContextData();
    await fetchContextData();

    if (isLogin.value) {
      await router.push('/welcome');
    } else {
      await router.push('/check-email');
    }

  } catch (err: any) {
    errorMsg.value = extractErrorMessage(err)
  } finally {
    password.value = '';
    confirmPassword.value = '';
    submitting.value = false;
  }
}
</script>

<style scoped>
</style>
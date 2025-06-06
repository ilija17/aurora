<template>
  <div class="grid place-items-center h-screen">
    <div>
      <h2 class="grid place-items-center mb-4">Unlock Encryption</h2>
      <form @submit.prevent="handleUnlock" class="space-y-4">
        <FormInput
          id="password"
          label="Password"
          type="password"
          v-model="password"
          placeholder="Enter your password"
          required
        />
        <button
          type="submit"
          :disabled="submitting || !password"
          class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Unlock
        </button>
      </form>
      <p v-if="errorMsg" class="mt-2 text-red-600">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDek } from '~/composables/useDek';

definePageMeta({ requiresAuth: true });

const router = useRouter();
const route = useRoute();
const { unlock } = useDek();

const password = ref('');
const errorMsg = ref('');
const submitting = ref(false);

async function handleUnlock() {
  errorMsg.value = '';
  submitting.value = true;
  try {
    await unlock(password.value);
    const redirectTo = route.query.redirect as string | undefined;
    await router.push(redirectTo ?? '/welcome');
  } catch (err: any) {
    errorMsg.value = err.message ?? 'Failed to unlock';
  } finally {
    submitting.value = false;
    password.value = '';
  }
}
</script>

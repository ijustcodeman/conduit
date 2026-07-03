<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const auth = useAuth();
const router = useRouter();

const form = reactive({
  username: '',
  email: '',
  password: '',
});

onMounted(() => {
  auth.clearErrors();
});

onBeforeUnmount(() => {
  auth.clearErrors();
});

async function submitRegistration() {
  try {
    await auth.register({
      username: form.username,
      email: form.email,
      password: form.password,
    });
    await router.push('/');
  } catch {
    // User-facing errors are exposed by the auth composable.
  }
}
</script>

<template>
  <section class="auth-page" aria-labelledby="register-title">
    <div class="auth-panel">
      <h1 id="register-title">Create account</h1>
      <p>
        <RouterLink to="/login">Already have an account?</RouterLink>
      </p>

      <ul v-if="auth.errorMessages.value.length" class="error-list" role="alert">
        <li v-for="message in auth.errorMessages.value" :key="message">
          {{ message }}
        </li>
      </ul>

      <form class="form-stack" @submit.prevent="submitRegistration">
        <label>
          Username
          <input
            v-model="form.username"
            autocomplete="username"
            name="username"
            required
            type="text"
          >
        </label>

        <label>
          Email
          <input
            v-model="form.email"
            autocomplete="email"
            name="email"
            required
            type="email"
          >
        </label>

        <label>
          Password
          <input
            v-model="form.password"
            autocomplete="new-password"
            minlength="8"
            name="password"
            required
            type="password"
          >
        </label>

        <button class="primary-action" :disabled="auth.isLoading.value" type="submit">
          {{ auth.isLoading.value ? 'Creating account...' : 'Create account' }}
        </button>
      </form>
    </div>
  </section>
</template>

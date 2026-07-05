<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const auth = useAuth();
const route = useRoute();
const router = useRouter();

const form = reactive({
  email: '',
  password: '',
});

const redirectTarget = computed(() =>
  typeof route.query.redirect === 'string' ? route.query.redirect : '/',
);

onMounted(() => {
  auth.clearErrors();
});

onBeforeUnmount(() => {
  auth.clearErrors();
});

/** Submits the login form and redirects to the requested page. */
async function submitLogin() {
  try {
    await auth.login({
      email: form.email,
      password: form.password,
    });
    await router.push(redirectTarget.value);
  } catch {
    // User facing errors are exposed by the auth composable.
  }
}
</script>

<template>
  <section class="auth-page" aria-labelledby="login-title">
    <div class="auth-panel">
      <h1 id="login-title">Sign in</h1>
      <p>
        <RouterLink to="/register">Need an account?</RouterLink>
      </p>

      <ul v-if="auth.errorMessages.value.length" class="error-list" role="alert">
        <li v-for="message in auth.errorMessages.value" :key="message">
          {{ message }}
        </li>
      </ul>

      <form class="form-stack" @submit.prevent="submitLogin">
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
            autocomplete="current-password"
            minlength="1"
            name="password"
            required
            type="password"
          >
        </label>

        <button class="primary-action" :disabled="auth.isLoading.value" type="submit">
          {{ auth.isLoading.value ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const auth = useAuth();
const router = useRouter();

async function logout() {
  auth.logout();
  await router.push('/');
}
</script>

<template>
  <header class="site-header">
    <nav class="site-nav" aria-label="Main navigation">
      <RouterLink class="brand" to="/">Conduit</RouterLink>
      <ul>
        <li>
          <RouterLink to="/">Home</RouterLink>
        </li>
        <li v-if="auth.isAuthenticated.value">
          <RouterLink to="/settings">Settings</RouterLink>
        </li>
        <li v-if="auth.isAuthenticated.value && auth.user.value" class="user-chip">
          {{ auth.user.value.username }}
        </li>
        <li v-if="auth.isAuthenticated.value">
          <button type="button" @click="logout">Log out</button>
        </li>
        <li v-if="!auth.isAuthenticated.value">
          <RouterLink to="/login">Sign in</RouterLink>
        </li>
        <li v-if="!auth.isAuthenticated.value">
          <RouterLink to="/register">Sign up</RouterLink>
        </li>
      </ul>
    </nav>
  </header>

  <main class="page-shell">
    <RouterView />
  </main>
</template>

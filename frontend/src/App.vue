<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const auth = useAuth();
const router = useRouter();
const isAccountMenuOpen = ref(false);
const defaultProfileImage = '/default-avatar.svg';

const profileRoute = computed(() => ({
  name: 'profile',
  params: { username: auth.user.value?.username ?? '' },
}));

/** Toggles the authenticated account dropdown menu. */
function toggleAccountMenu() {
  isAccountMenuOpen.value = !isAccountMenuOpen.value;
}

/** Closes the authenticated account dropdown menu. */
function closeAccountMenu() {
  isAccountMenuOpen.value = false;
}

/** Logs out the current user and returns to the home page. */
async function logout() {
  closeAccountMenu();
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
          <RouterLink to="/editor">Write</RouterLink>
        </li>
        <li v-if="auth.isAuthenticated.value && auth.user.value" class="account-menu">
          <button
            class="account-menu-button"
            type="button"
            :aria-expanded="isAccountMenuOpen"
            aria-haspopup="menu"
            @click="toggleAccountMenu"
          >
            <img
              :src="auth.user.value.image || defaultProfileImage"
              :alt="`${auth.user.value.username}'s profile image`"
            >
            <span>{{ auth.user.value.username }}</span>
          </button>

          <div v-if="isAccountMenuOpen" class="account-menu-panel" role="menu">
            <RouterLink
              :to="profileRoute"
              role="menuitem"
              @click="closeAccountMenu"
            >
              Profile
            </RouterLink>
            <RouterLink to="/settings" role="menuitem" @click="closeAccountMenu">
              Settings
            </RouterLink>
            <button type="button" role="menuitem" @click="logout">Log out</button>
          </div>
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

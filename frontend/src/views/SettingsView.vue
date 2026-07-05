<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import type { UpdateUserPayload } from '@/types/api';

const auth = useAuth();
const successMessage = ref('');

const form = reactive({
  username: '',
  email: '',
  currentPassword: '',
  password: '',
  bio: '',
  image: '',
});

const imagePreview = computed(() =>
  form.image.trim() ? form.image.trim() : '/default-avatar.svg',
);

onMounted(() => {
  auth.clearErrors();
});

watch(
  () => auth.user.value,
  user => {
    if (!user) {
      return;
    }

    form.username = user.username;
    form.email = user.email;
    form.bio = user.bio;
    form.image = user.image;
    form.currentPassword = '';
    form.password = '';
    successMessage.value = '';
  },
  { immediate: true },
);

/** Submits changed settings and displays a local success message. */
async function submitSettings() {
  const payload = buildUpdatePayload();

  if (Object.keys(payload).length === 0) {
    successMessage.value = 'No changes to save.';
    auth.clearErrors();
    return;
  }

  try {
    await auth.updateCurrentUser(payload);
    form.currentPassword = '';
    form.password = '';
    auth.clearErrors();
    successMessage.value = 'Settings saved.';
  } catch {
    successMessage.value = '';
  }
}

/** Builds an update payload containing only fields that changed. */
function buildUpdatePayload(): UpdateUserPayload {
  const currentUser = auth.user.value;
  const payload: UpdateUserPayload = {};

  if (!currentUser) {
    return payload;
  }

  const username = form.username.trim();
  const email = form.email.trim();
  const bio = form.bio.trim();
  const image = form.image.trim();
  const currentPassword = form.currentPassword;
  const password = form.password;

  if (username && username !== currentUser.username) {
    payload.username = username;
  }

  if (email && email !== currentUser.email) {
    payload.email = email;
  }

  if (bio !== currentUser.bio) {
    payload.bio = bio;
  }

  if (image !== currentUser.image) {
    payload.image = image;
  }

  if (password) {
    payload.currentPassword = currentPassword;
    payload.password = password;
  }

  return payload;
}
</script>

<template>
  <section class="settings-page" aria-labelledby="settings-title">
    <header class="page-heading">
      <h1 id="settings-title">Settings</h1>
    </header>

    <div class="settings-layout">
      <aside class="settings-preview" aria-label="Profile preview">
        <img :src="imagePreview" alt="Profile preview">
        <h2>{{ form.username || auth.user.value?.username }}</h2>
        <p>{{ form.bio || 'No bio yet.' }}</p>
      </aside>

      <form class="settings-form" @submit.prevent="submitSettings">
        <ul v-if="auth.errorMessages.value.length" class="error-list" role="alert">
          <li v-for="message in auth.errorMessages.value" :key="message">
            {{ message }}
          </li>
        </ul>

        <p v-if="successMessage" class="status-message" role="status">
          {{ successMessage }}
        </p>

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
          Current password
          <input
            v-model="form.currentPassword"
            autocomplete="current-password"
            minlength="1"
            name="current-password"
            :required="Boolean(form.password)"
            type="password"
          >
        </label>

        <label>
          New password
          <input
            v-model="form.password"
            autocomplete="new-password"
            minlength="8"
            name="password"
            type="password"
          >
        </label>

        <label>
          Bio
          <textarea
            v-model="form.bio"
            name="bio"
            rows="5"
          />
        </label>

        <label>
          Profile image URL
          <input
            v-model="form.image"
            autocomplete="url"
            name="image"
            type="url"
          >
        </label>

        <button class="primary-action" :disabled="auth.isLoading.value" type="submit">
          {{ auth.isLoading.value ? 'Saving...' : 'Save settings' }}
        </button>
      </form>
    </div>
  </section>
</template>

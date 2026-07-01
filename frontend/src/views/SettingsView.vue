<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';

const auth = useAuth();

const form = reactive({
  username: '',
  email: '',
  password: '',
  bio: '',
  image: '',
});

const successMessage = computed(() =>
  auth.user.value ? `Settings are loaded for ${auth.user.value.username}.` : '',
);

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
    form.password = '';
  },
  { immediate: true },
);
</script>

<template>
  <section class="page-heading" aria-labelledby="settings-title">
    <p>Your account</p>
    <h1 id="settings-title">Settings</h1>
  </section>

  <section class="content-panel" aria-label="Account settings">
    <p v-if="successMessage" class="status-message">{{ successMessage }}</p>
    <p>
      Updating settings is part of the later frontend workflow. This page is
      protected already and ready for the form action.
    </p>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <section class="page-heading" aria-labelledby="profile-title">
    <p>Profile</p>
    <h1 id="profile-title">{{ route.params.username }}</h1>
  </section>

  <section class="content-panel">
    <p>The profile view is ready for the follow/unfollow workflow step.</p>
  </section>
</template>

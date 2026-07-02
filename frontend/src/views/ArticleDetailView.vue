<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <section class="page-heading" aria-labelledby="article-title">
    <p>Article</p>
    <h1 id="article-title">{{ route.params.slug }}</h1>
  </section>

  <section class="content-panel">
    <p>The full article view is part of the next frontend workflow step.</p>
  </section>
</template>

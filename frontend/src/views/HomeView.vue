<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuth } from '@/composables/useAuth';

const auth = useAuth();
const activeFeed = ref<'global' | 'personal'>('global');

const pageTitle = computed(() =>
  activeFeed.value === 'global' ? 'Global Feed' : 'Your Feed',
);
</script>

<template>
  <section class="page-heading" aria-labelledby="home-title">
    <p>Web Engineering 2</p>
    <h1 id="home-title">{{ pageTitle }}</h1>
  </section>

  <section class="feed-layout" aria-label="Article feeds">
    <div class="feed-main">
      <div class="tab-list" role="tablist" aria-label="Feed selector">
        <button
          :class="{ active: activeFeed === 'global' }"
          type="button"
          role="tab"
          :aria-selected="activeFeed === 'global'"
          @click="activeFeed = 'global'"
        >
          Global Feed
        </button>
        <button
          :class="{ active: activeFeed === 'personal' }"
          :disabled="!auth.isAuthenticated.value"
          type="button"
          role="tab"
          :aria-selected="activeFeed === 'personal'"
          @click="activeFeed = 'personal'"
        >
          Your Feed
        </button>
      </div>

      <article class="empty-state" aria-labelledby="articles-placeholder-title">
        <h2 id="articles-placeholder-title">Articles come next</h2>
        <p>
          The API and auth foundation is ready for the article list, tags,
          favorites, and pagination workflow.
        </p>
      </article>
    </div>

    <aside class="sidebar" aria-labelledby="tags-title">
      <h2 id="tags-title">Popular Tags</h2>
      <p>Tag loading will be connected with the article list step.</p>
    </aside>
  </section>
</template>

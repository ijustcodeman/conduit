<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import ArticlePreview from '@/components/ArticlePreview.vue';
import { useArticles, type ArticleFeedMode } from '@/composables/useArticles';
import { useAuth } from '@/composables/useAuth';
import { useTags } from '@/composables/useTags';

const auth = useAuth();
const activeFeed = ref<ArticleFeedMode>('global');
const selectedTag = ref<string | null>(null);
const showAllTags = ref(false);
const articles = useArticles({
  feedMode: activeFeed,
  selectedTag,
});
const tags = useTags();
const visibleTagLimit = 12;

const pageTitle = computed(() =>
  selectedTag.value
    ? `Articles tagged ${selectedTag.value}`
    : activeFeed.value === 'global'
      ? 'Global Feed'
      : 'Your Feed',
);
const visibleTags = computed(() =>
  showAllTags.value ? tags.tags.value : tags.tags.value.slice(0, visibleTagLimit),
);
const hiddenTagsCount = computed(() =>
  Math.max(0, tags.tags.value.length - visibleTagLimit),
);

watch(activeFeed, feed => {
  if (feed === 'personal') {
    selectedTag.value = null;
  }
});

onMounted(() => {
  void tags.fetchTags();
});

/** Shows the global article feed. */
function selectGlobalFeed() {
  activeFeed.value = 'global';
}

/** Shows the authenticated user's personal article feed. */
function selectPersonalFeed() {
  activeFeed.value = 'personal';
}

/** Toggles the selected tag filter and returns to the global feed. */
function selectTag(tag: string) {
  activeFeed.value = 'global';
  selectedTag.value = selectedTag.value === tag ? null : tag;
}

/** Removes the current tag filter. */
function clearTag() {
  selectedTag.value = null;
}
</script>

<template>
  <section class="page-heading" aria-labelledby="home-title">
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
          @click="selectGlobalFeed"
        >
          Global Feed
        </button>
        <button
          :class="{ active: activeFeed === 'personal' }"
          :disabled="!auth.isAuthenticated.value"
          type="button"
          role="tab"
          :aria-selected="activeFeed === 'personal'"
          @click="selectPersonalFeed"
        >
          Your Feed
        </button>
        <button
          v-if="selectedTag"
          class="active"
          type="button"
          :aria-label="`Clear ${selectedTag} tag filter`"
          @click="clearTag"
        >
          #{{ selectedTag }} ×
        </button>
      </div>

      <ul v-if="articles.errorMessages.value.length" class="error-list" role="alert">
        <li v-for="message in articles.errorMessages.value" :key="message">
          {{ message }}
        </li>
      </ul>

      <p v-if="articles.isLoading.value" class="list-status">Loading articles...</p>

      <article
        v-else-if="!articles.articles.value.length"
        class="empty-state"
        aria-labelledby="articles-empty-title"
      >
        <h2 id="articles-empty-title">No articles found</h2>
        <p>Try another feed or tag.</p>
      </article>

      <ol v-else class="article-list" aria-label="Articles">
        <li v-for="article in articles.articles.value" :key="article.slug">
          <ArticlePreview
            :article="article"
            :is-favorite-pending="articles.pendingFavoriteSlug.value === article.slug"
            @favorite="articles.toggleFavorite"
          />
        </li>
      </ol>

      <nav
        v-if="articles.articlesCount.value > 0"
        class="pagination"
        aria-label="Article pagination"
      >
        <button
          type="button"
          :disabled="!articles.canGoPrevious.value || articles.isLoading.value"
          @click="articles.goPrevious"
        >
          Previous
        </button>
        <p>
          Page {{ articles.page.value }} of {{ articles.totalPages.value }}
        </p>
        <button
          type="button"
          :disabled="!articles.canGoNext.value || articles.isLoading.value"
          @click="articles.goNext"
        >
          Next
        </button>
      </nav>
    </div>

    <aside class="sidebar" aria-labelledby="tags-title">
      <h2 id="tags-title">Explore tags</h2>
      <p v-if="tags.isLoading.value">Loading tags...</p>
      <ul v-else-if="tags.tags.value.length" class="tag-cloud">
        <li v-for="tag in visibleTags" :key="tag">
          <button
            :class="{ active: selectedTag === tag }"
            type="button"
            :aria-pressed="selectedTag === tag"
            @click="selectTag(tag)"
          >
            {{ tag }}
          </button>
        </li>
      </ul>
      <p v-else>No tags yet.</p>

      <button
        v-if="hiddenTagsCount > 0"
        class="tag-toggle-button"
        type="button"
        @click="showAllTags = !showAllTags"
      >
        {{ showAllTags ? 'Show fewer' : `Show ${hiddenTagsCount} more` }}
      </button>

      <ul v-if="tags.errorMessages.value.length" class="error-list compact" role="alert">
        <li v-for="message in tags.errorMessages.value" :key="message">
          {{ message }}
        </li>
      </ul>
    </aside>
  </section>
</template>
